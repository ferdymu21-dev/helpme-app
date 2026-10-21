import { NextRequest, NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import {
  requireSiagaApiUser,
  SiagaApiError,
} from "@/features/siaga/server/require-siaga-api-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_CATEGORIES = [
  "AMBULANCE",
  "MEDICAL",
  "FIRE_RESCUE",
  "DISASTER_RELIEF",
  "SEARCH_RESCUE",
  "COMMUNITY_SUPPORT",
  "OTHER",
] as const;

const ALLOWED_COST_TYPES = [
  "FREE",
  "PAID",
  "DONATION",
  "VARIES",
  "UNKNOWN",
] as const;

async function readJsonWithinLimit(request: NextRequest): Promise<unknown> {
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
  if (!reader) throw new Error("INVALID_JSON");

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
          // Pembatalan stream adalah best-effort.
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

function readText(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null {
  const value = body[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("INVALID_INPUT");

  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error("INVALID_INPUT");
  return normalized || null;
}

function readRequiredText(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = readText(body, key, maxLength);
  if (value === null) throw new Error("INVALID_INPUT");
  return value;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: organizationId } = await context.params;

    if (!UUID_PATTERN.test(organizationId)) {
      return jsonNoStore({ message: "ID organisasi tidak valid." }, 400);
    }

    const user = await requireSiagaApiUser(request);

    let body: unknown;
    try {
      body = await readJsonWithinLimit(request);
    } catch (error) {
      const code = error instanceof Error ? error.message : "INVALID_JSON";

      if (code === "REQUEST_TOO_LARGE") {
        return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
      }

      return jsonNoStore({ message: "Body permintaan bukan JSON yang valid." }, 400);
    }

    if (!isRecord(body)) {
      return jsonNoStore({ message: "Data layanan tidak valid." }, 400);
    }

    const serviceName = readRequiredText(body, "serviceName", 200);
    const serviceCategory = readRequiredText(body, "serviceCategory", 40).toUpperCase();
    const serviceDescription = readRequiredText(body, "serviceDescription", 4000);
    const servicePhone = readText(body, "servicePhone", 80);
    const serviceWhatsapp = readText(body, "serviceWhatsapp", 80);
    const serviceArea = readRequiredText(body, "serviceArea", 500);
    const costType = readRequiredText(body, "costType", 20).toUpperCase();
    const operatingHours = readText(body, "operatingHours", 500);

    if (!(ALLOWED_CATEGORIES as readonly string[]).includes(serviceCategory)) {
      return jsonNoStore({ message: "Kategori layanan tidak valid." }, 400);
    }

    if (!(ALLOWED_COST_TYPES as readonly string[]).includes(costType)) {
      return jsonNoStore({ message: "Jenis biaya layanan tidak valid." }, 400);
    }

    const { error } = await adminSupabase.rpc(
      "create_emergency_provider_service",
      {
        p_actor_user_id: user.id,
        p_organization_id: organizationId,
        p_service_name: serviceName,
        p_service_category: serviceCategory,
        p_service_description: serviceDescription,
        p_service_phone: servicePhone,
        p_service_whatsapp: serviceWhatsapp,
        p_service_area: serviceArea,
        p_cost_type: costType,
        p_operating_hours: operatingHours,
      },
    );

    if (error) {
      const message = error.message ?? "";

      if (
        message.includes("ACCOUNT_UNAVAILABLE") ||
        message.includes("FORBIDDEN") ||
        error.code === "42501"
      ) {
        return jsonNoStore({ message: "Akun tidak memiliki izin untuk mendaftarkan layanan." }, 403);
      }

      if (message.includes("ORGANIZATION_NOT_FOUND") || error.code === "P0002") {
        return jsonNoStore({ message: "Organisasi tidak ditemukan." }, 404);
      }

      if (
        message.includes("ORGANIZATION_NOT_READY_FOR_SERVICE") ||
        error.code === "55000"
      ) {
        return jsonNoStore({ message: "Organisasi belum memenuhi syarat untuk mendaftarkan layanan." }, 409);
      }

      if (
        [
          "REQUIRED_FIELDS_MISSING",
          "INVALID_SERVICE_CATEGORY",
          "INVALID_COST_TYPE",
        ].some((token) => message.includes(token)) ||
        ["22023", "22001", "23502", "23514"].includes(error.code)
      ) {
        return jsonNoStore({ message: "Data layanan tidak valid atau belum lengkap." }, 400);
      }

      if (["PGRST202", "PGRST205", "42883", "42P01"].includes(error.code)) {
        return jsonNoStore({ message: "Fitur pendaftaran layanan belum tersedia pada database." }, 503);
      }

      console.error("Siaga provider service creation RPC failed:", error.code);
      return jsonNoStore({ message: "Gagal mendaftarkan layanan Siaga." }, 500);
    }

    return jsonNoStore({
      message: "Layanan berhasil diajukan. Status menunggu review dan layanan belum aktif.",
    }, 201);
  } catch (error) {
    if (error instanceof SiagaApiError) {
      return jsonNoStore(
        { message: error.message },
        error.code === "UNAUTHORIZED" ? 401 : 403,
      );
    }

    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (code === "UNAUTHORIZED") {
      return jsonNoStore({ message: "Silakan login kembali." }, 401);
    }
    if (code === "FORBIDDEN") {
      return jsonNoStore({ message: "Anda tidak memiliki akses." }, 403);
    }
    if (code === "INVALID_INPUT") {
      return jsonNoStore({ message: "Data layanan tidak valid atau belum lengkap." }, 400);
    }
    if (code === "REQUEST_TOO_LARGE") {
      return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
    }
    if (code === "INVALID_JSON") {
      return jsonNoStore({ message: "Body permintaan bukan JSON yang valid." }, 400);
    }

    console.error("Siaga provider service creation API failed:", code);
    return jsonNoStore({ message: "Gagal mendaftarkan layanan Siaga." }, 500);
  }
}