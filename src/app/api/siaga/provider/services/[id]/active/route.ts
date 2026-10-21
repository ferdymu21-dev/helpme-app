import { NextRequest, NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireSiagaApiUser, SiagaApiError } from "@/features/siaga/server/require-siaga-api-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function jsonNoStore(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonWithinLimit(request: NextRequest, maxBytes: number): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try { await reader.cancel(); } catch { /* Best-effort cancellation after the size limit. */ }
        throw new Error("REQUEST_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("INVALID_JSON");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return jsonNoStore({ message: "ID layanan tidak valid." }, 400);

    const user = await requireSiagaApiUser(request);
    let body: unknown;
    try {
      body = await readJsonWithinLimit(request, 4096);
    } catch (error) {
      const code = error instanceof Error ? error.message : "INVALID_JSON";
      if (code === "REQUEST_TOO_LARGE") {
        return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
      }
      return jsonNoStore({ message: "Body permintaan bukan JSON yang valid." }, 400);
    }
    if (!isRecord(body) || typeof body.isActive !== "boolean") {
      return jsonNoStore({ message: "Status aktif layanan tidak valid." }, 400);
    }

    const { data, error } = await adminSupabase.rpc("set_emergency_service_active", {
      p_actor_user_id: user.id,
      p_service_id: id,
      p_is_active: body.isActive,
    });

    if (error) {
      const message = error.message ?? "";
      if (message.includes("ACCOUNT_UNAVAILABLE") || message.includes("FORBIDDEN") || error.code === "42501") {
        return jsonNoStore({ message: "Akun tidak memiliki izin untuk mengubah status layanan." }, 403);
      }
      if (message.includes("SERVICE_NOT_FOUND") || message.includes("ORGANIZATION_NOT_FOUND") || error.code === "P0002") {
        return jsonNoStore({ message: "Layanan atau organisasi tidak ditemukan." }, 404);
      }
      if (message.includes("SERVICE_NOT_ELIGIBLE_FOR_ACTIVATION") || error.code === "55000") {
        return jsonNoStore({ message: "Layanan hanya dapat diaktifkan setelah organisasi diverifikasi dan layanan disetujui." }, 409);
      }
      if (["PGRST202", "PGRST205", "42883", "42P01"].includes(error.code)) {
        return jsonNoStore({ message: "Fitur aktivasi layanan Siaga belum tersedia pada database." }, 503);
      }
      console.error("Siaga provider service activation RPC failed:", error.code);
      return jsonNoStore({ message: "Gagal mengubah status layanan Siaga." }, 500);
    }

    if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) {
      console.error("Siaga provider service activation returned an invalid result.");
      return jsonNoStore({ message: "Respons status layanan tidak valid." }, 500);
    }
    const row = data[0];
    if (
      row.result_service_id !== id ||
      typeof row.result_organization_id !== "string" ||
      typeof row.result_review_status !== "string" ||
      typeof row.result_is_active !== "boolean"
    ) {
      console.error("Siaga provider service activation result validation failed.");
      return jsonNoStore({ message: "Respons status layanan tidak valid." }, 500);
    }

    return jsonNoStore({
      service: {
        id: row.result_service_id,
        organizationId: row.result_organization_id,
        reviewStatus: row.result_review_status,
        isActive: row.result_is_active,
      },
      message: row.result_is_active ? "Layanan berhasil diaktifkan." : "Layanan berhasil dinonaktifkan.",
    }, 200);
  } catch (error) {
    if (error instanceof SiagaApiError) {
      return jsonNoStore({ message: error.message }, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (code === "UNAUTHORIZED") return jsonNoStore({ message: "Silakan login kembali." }, 401);
    if (code === "FORBIDDEN") return jsonNoStore({ message: "Anda tidak memiliki akses." }, 403);
    console.error("Siaga provider service activation API failed:", code);
    return jsonNoStore({ message: "Gagal mengubah status layanan Siaga." }, 500);
  }
}
