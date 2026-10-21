import { NextRequest, NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireSiagaAdmin } from "@/features/admin/siaga/server/require-siaga-admin";

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

async function readJson(request: NextRequest): Promise<unknown> {
  const maxBytes = 16 * 1024;
  const contentLength = request.headers.get("content-length");
  if (
    contentLength !== null &&
    /^\d+$/.test(contentLength) &&
    Number(contentLength) > maxBytes
  ) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error("INVALID_JSON");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // Cancellation is best-effort after crossing the request-size limit.
        }
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) {
      return jsonNoStore({ message: "ID layanan tidak valid." }, 400);
    }

    const body = await readJson(request);
    if (!isRecord(body) || typeof body.decision !== "string") {
      return jsonNoStore({ message: "Data review layanan tidak valid." }, 400);
    }

    const decision = body.decision.trim().toUpperCase();
    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return jsonNoStore({ message: "Keputusan harus berupa persetujuan atau penolakan." }, 400);
    }

    let reason: string | null = null;
    if (body.reason !== undefined && body.reason !== null) {
      if (typeof body.reason !== "string" || body.reason.trim().length > 2000) {
        return jsonNoStore({ message: "Alasan keputusan tidak valid." }, 400);
      }
      reason = body.reason.trim() || null;
    }
    if (decision === "REJECTED" && (!reason || reason.length < 3)) {
      return jsonNoStore({ message: "Alasan penolakan minimal 3 karakter." }, 400);
    }

    const { user } = await requireSiagaAdmin();
    const { data, error } = await adminSupabase.rpc("admin_review_emergency_service", {
      p_actor_user_id: user.id,
      p_service_id: id,
      p_decision: decision,
      p_reason: reason,
    });

    if (error) {
      const message = error.message ?? "";
      if (message.includes("FORBIDDEN") || error.code === "42501") {
        return jsonNoStore({ message: "Anda tidak memiliki akses untuk meninjau layanan." }, 403);
      }
      if (message.includes("SERVICE_NOT_FOUND") || message.includes("ORGANIZATION_NOT_FOUND") || error.code === "P0002") {
        return jsonNoStore({ message: "Layanan atau organisasi tidak ditemukan." }, 404);
      }
      if (message.includes("ORGANIZATION_NOT_VERIFIED") || message.includes("SERVICE_NOT_PENDING_REVIEW") || error.code === "55000") {
        return jsonNoStore({ message: "Organisasi harus terverifikasi dan layanan harus berstatus menunggu review." }, 409);
      }
      if (message.includes("INVALID_SERVICE_DECISION") || message.includes("REJECTION_REASON_REQUIRED") || error.code === "22023") {
        return jsonNoStore({ message: "Data keputusan review tidak valid." }, 400);
      }
      if (["PGRST202", "PGRST205", "42883", "42P01"].includes(error.code)) {
        return jsonNoStore({ message: "Fitur review layanan Siaga belum tersedia pada database." }, 503);
      }
      console.error("Admin Siaga service review RPC failed:", error.code);
      return jsonNoStore({ message: "Gagal menyimpan keputusan review layanan." }, 500);
    }

    if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) {
      console.error("Admin Siaga service review returned an invalid result.");
      return jsonNoStore({ message: "Respons review layanan tidak valid." }, 500);
    }
    const row = data[0];
    if (
      row.result_service_id !== id ||
      typeof row.result_organization_id !== "string" ||
      (row.result_review_status !== "APPROVED" && row.result_review_status !== "REJECTED") ||
      typeof row.result_is_active !== "boolean"
    ) {
      console.error("Admin Siaga service review result validation failed.");
      return jsonNoStore({ message: "Respons review layanan tidak valid." }, 500);
    }

    return jsonNoStore({
      service: {
        id: row.result_service_id,
        organizationId: row.result_organization_id,
        reviewStatus: row.result_review_status,
        isActive: row.result_is_active,
        reviewedAt: typeof row.result_reviewed_at === "string" ? row.result_reviewed_at : null,
        reviewedBy: typeof row.result_reviewed_by === "string" ? row.result_reviewed_by : null,
        rejectionReason: typeof row.result_rejection_reason === "string" ? row.result_rejection_reason : null,
      },
    }, 200);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (code === "UNAUTHORIZED") return jsonNoStore({ message: "Silakan login kembali." }, 401);
    if (code === "FORBIDDEN" || code === "BANNED") return jsonNoStore({ message: "Anda tidak memiliki akses admin." }, 403);
    if (code === "REQUEST_TOO_LARGE") return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
    if (code === "INVALID_JSON") return jsonNoStore({ message: "Body permintaan bukan JSON yang valid." }, 400);
    console.error("Admin Siaga service review API failed:", code);
    return jsonNoStore({ message: "Gagal memproses review layanan Siaga." }, 500);
  }
}
