import { NextRequest, NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import {
  requireSiagaApiUser,
  SiagaApiError,
} from "@/features/siaga/server/require-siaga-api-user";

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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_TYPES = [
  "GOVERNMENT_AGENCY",
  "FOUNDATION",
  "SOCIAL_ORGANIZATION",
  "HEALTHCARE_FACILITY",
  "COMMUNITY_ORGANIZATION",
  "AMBULANCE_PROVIDER",
  "DISASTER_RELIEF",
  "SEARCH_AND_RESCUE",
  "OTHER",
] as const;

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

function readCoordinate(
  body: Record<string, unknown>,
  key: string,
): number | null {
  const value = body[key];

  if (value === null || value === undefined || value === "") return null;

  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("INVALID_INPUT");
  }

  if (typeof value === "string" && !value.trim()) return null;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error("INVALID_INPUT");
  return parsed;
}

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
          // Pembatalan stream merupakan best-effort.
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) {
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
      return jsonNoStore({ message: "Data organisasi tidak valid." }, 400);
    }

    const organizationName = readRequiredText(body, "organizationName", 200);
    const organizationType = readRequiredText(body, "organizationType", 40).toUpperCase();
    const registrationIdentifier = readText(body, "registrationIdentifier", 200);
    const description = readRequiredText(body, "description", 4000);
    const officialPhone = readText(body, "officialPhone", 80);
    const officialWhatsapp = readText(body, "officialWhatsapp", 80);
    const contactEmail = readText(body, "contactEmail", 254);
    const websiteUrl = readText(body, "websiteUrl", 500);
    const publicAddress = readText(body, "publicAddress", 500);
    const district = readText(body, "district", 120);
    const city = readText(body, "city", 100);
    const province = readText(body, "province", 100);
    const coverageDescription = readRequiredText(body, "coverageDescription", 1000);
    const latitude = readCoordinate(body, "latitude");
    const longitude = readCoordinate(body, "longitude");

    if (
      !(ALLOWED_TYPES as readonly string[]).includes(organizationType) ||
      typeof body.coordinatesPublic !== "boolean"
    ) {
      return jsonNoStore({ message: "Jenis organisasi atau pilihan koordinat tidak valid." }, 400);
    }

    if ((latitude === null) !== (longitude === null)) {
      return jsonNoStore({ message: "Latitude dan longitude harus diisi berpasangan." }, 400);
    }

    if (
      latitude !== null &&
      longitude !== null &&
      (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    ) {
      return jsonNoStore({ message: "Koordinat di luar rentang yang valid." }, 400);
    }

    if (body.coordinatesPublic && latitude === null) {
      return jsonNoStore({ message: "Koordinat publik memerlukan lokasi." }, 400);
    }

    if (!officialPhone && !officialWhatsapp) {
      return jsonNoStore({ message: "Isi minimal satu kontak resmi: telepon atau WhatsApp." }, 400);
    }

    if (
      websiteUrl !== null &&
      (() => {
        try {
          const url = new URL(websiteUrl);
          return url.protocol !== "http:" && url.protocol !== "https:";
        } catch {
          return true;
        }
      })()
    ) {
      return jsonNoStore({ message: "URL situs organisasi tidak valid." }, 400);
    }

    const { data, error } = await adminSupabase.rpc(
      "update_emergency_organization_profile",
      {
        p_actor_user_id: user.id,
        p_organization_id: id,
        p_organization_name: organizationName,
        p_organization_type: organizationType,
        p_registration_identifier: registrationIdentifier,
        p_description: description,
        p_official_phone: officialPhone,
        p_official_whatsapp: officialWhatsapp,
        p_contact_email: contactEmail,
        p_website_url: websiteUrl,
        p_public_address: publicAddress,
        p_district: district,
        p_city: city,
        p_province: province,
        p_coverage_description: coverageDescription,
        p_latitude: latitude,
        p_longitude: longitude,
        p_coordinates_public: body.coordinatesPublic,
      },
    );

    if (error) {
      const message = error.message ?? "";

      if (
        message.includes("ACCOUNT_UNAVAILABLE") ||
        message.includes("FORBIDDEN") ||
        error.code === "42501"
      ) {
        return jsonNoStore({ message: "Akun tidak memiliki izin untuk mengubah organisasi." }, 403);
      }

      if (message.includes("ORGANIZATION_NOT_FOUND") || error.code === "P0002") {
        return jsonNoStore({ message: "Organisasi tidak ditemukan." }, 404);
      }

      if (
        message.includes("SUSPENDED_ORGANIZATION_CANNOT_BE_EDITED") ||
        error.code === "55000"
      ) {
        return jsonNoStore({ message: "Organisasi yang ditangguhkan tidak dapat diedit." }, 409);
      }

      if (
        [
          "REQUIRED_FIELDS_MISSING",
          "INVALID_ORGANIZATION_TYPE",
          "COORDINATE_PAIR_REQUIRED",
          "COORDINATES_OUT_OF_RANGE",
          "PUBLIC_COORDINATES_REQUIRE_LOCATION",
          "INVALID_WEBSITE_URL",
          "ORGANIZATION_CONTACT_REQUIRED",
        ].some((token) => message.includes(token)) ||
        ["22023", "22001", "23502", "23514"].includes(error.code)
      ) {
        return jsonNoStore({ message: "Data organisasi tidak valid atau belum lengkap." }, 400);
      }

      if (["PGRST202", "PGRST205", "42883", "42P01"].includes(error.code)) {
        return jsonNoStore({ message: "Fitur edit profil Siaga belum tersedia pada database." }, 503);
      }

      console.error("Siaga organization profile update RPC failed:", error.code);
      return jsonNoStore({ message: "Gagal memperbarui profil organisasi." }, 500);
    }

    if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) {
      return jsonNoStore({ message: "Respons pembaruan organisasi tidak valid." }, 500);
    }

    const row = data[0];
    if (
      row.result_organization_id !== id ||
      row.result_verification_status !== "PENDING" ||
      typeof row.result_updated_at !== "string" ||
      !Number.isFinite(Date.parse(row.result_updated_at))
    ) {
      return jsonNoStore({ message: "Respons pembaruan organisasi tidak valid." }, 500);
    }

    return jsonNoStore({
      organization: {
        id: row.result_organization_id,
        verificationStatus: row.result_verification_status,
        updatedAt: row.result_updated_at,
      },
      message:
        "Profil diperbarui. Verifikasi organisasi perlu diulang dan layanan aktif dinonaktifkan sementara.",
    }, 200);
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
      return jsonNoStore({ message: "Data organisasi tidak valid atau belum lengkap." }, 400);
    }
    if (code === "REQUEST_TOO_LARGE") {
      return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
    }
    if (code === "INVALID_JSON") {
      return jsonNoStore({ message: "Body permintaan bukan JSON yang valid." }, 400);
    }

    console.error("Siaga organization profile API failed:", code);
    return jsonNoStore({ message: "Gagal memperbarui profil organisasi." }, 500);
  }
}