import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

const DEFAULT_CITY = "Surabaya";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const ALLOWED_CATEGORIES = new Set([
  "AMBULANCE",
  "MEDICAL",
  "SECURITY",
  "FIRE_RESCUE",
  "DISASTER_RELIEF",
  "SEARCH_RESCUE",
  "COMMUNITY_SUPPORT",
  "OTHER",
]);

class InvalidSiagaDirectoryQueryError extends Error {}

interface PublicEmergencyDirectoryItem {
  organizationId: string;
  organizationName: string;
  organizationType: string;
  description: string;
  publicPhone: string | null;
  publicWhatsapp: string | null;
  websiteUrl: string | null;
  publicAddress: string | null;
  district: string | null;
  city: string;
  province: string;
  coverageDescription: string;
  latitude: number | null;
  longitude: number | null;
  verifiedAt: string;
  verifiedSourceLabel: string;
  verifiedSourceUrl: string | null;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  servicePhone: string | null;
  serviceWhatsapp: string | null;
  serviceArea: string;
  costType: string;
  operatingHours: string | null;
  distanceMeters: number | null;
}

function jsonNoStore(
  body: unknown,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function readSingleParameter(
  params: URLSearchParams,
  name: string,
): string | null {
  const values = params.getAll(name);

  if (values.length > 1) {
    throw new InvalidSiagaDirectoryQueryError(
      `Parameter "${name}" hanya boleh dikirim satu kali.`,
    );
  }

  return values[0] ?? null;
}

function readOptionalText(
  params: URLSearchParams,
  name: string,
  maxLength: number,
): string | null {
  const raw = readSingleParameter(params, name);

  if (raw === null) {
    return null;
  }

  const value = raw.trim();

  if (value.length === 0) {
    return null;
  }

  if (
    value.length > maxLength ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    throw new InvalidSiagaDirectoryQueryError(
      `Parameter "${name}" tidak valid.`,
    );
  }

  return value;
}

function readLimit(
  params: URLSearchParams,
): number {
  const raw = readSingleParameter(params, "limit");

  if (raw === null) {
    return DEFAULT_LIMIT;
  }

  const normalized = raw.trim();

  if (!/^\d{1,3}$/.test(normalized)) {
    throw new InvalidSiagaDirectoryQueryError(
      "Parameter limit harus berupa bilangan bulat antara 1 dan 100.",
    );
  }

  const value = Number(normalized);

  if (value < 1 || value > MAX_LIMIT) {
    throw new InvalidSiagaDirectoryQueryError(
      "Parameter limit harus berada antara 1 dan 100.",
    );
  }

  return value;
}

function readCoordinate(
  params: URLSearchParams,
  name: "latitude" | "longitude",
  minimum: number,
  maximum: number,
): number | null {
  const raw = readSingleParameter(params, name);

  if (raw === null) {
    return null;
  }

  const normalized = raw.trim();

  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)
  ) {
    throw new InvalidSiagaDirectoryQueryError(
      `Parameter "${name}" harus berupa angka yang valid.`,
    );
  }

  const value = Number(normalized);

  if (
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new InvalidSiagaDirectoryQueryError(
      `Parameter "${name}" berada di luar rentang yang valid.`,
    );
  }

  return value;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireString(
  row: Record<string, unknown>,
  column: string,
): string {
  const value = row[column];

  if (typeof value !== "string") {
    throw new Error(
      `Kolom direktori Siaga "${column}" tidak valid.`,
    );
  }

  return value;
}

function readNullableString(
  row: Record<string, unknown>,
  column: string,
): string | null {
  const value = row[column];

  if (value === null) {
    return null;
  }

  return requireString(row, column);
}

function readNullableNumber(
  row: Record<string, unknown>,
  column: string,
): number | null {
  const value = row[column];

  if (value === null) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Kolom direktori Siaga "${column}" tidak valid.`,
    );
  }

  return value;
}

function mapPublicDirectoryItem(
  value: unknown,
): PublicEmergencyDirectoryItem {
  if (!isRecord(value)) {
    throw new Error(
      "Format baris direktori Siaga tidak valid.",
    );
  }

  return {
    organizationId: requireString(value, "organization_id"),
    organizationName: requireString(value, "organization_name"),
    organizationType: requireString(value, "organization_type"),
    description: requireString(value, "description"),
    publicPhone: readNullableString(value, "public_phone"),
    publicWhatsapp: readNullableString(value, "public_whatsapp"),
    websiteUrl: readNullableString(value, "website_url"),
    publicAddress: readNullableString(value, "public_address"),
    district: readNullableString(value, "district"),
    city: requireString(value, "city"),
    province: requireString(value, "province"),
    coverageDescription: requireString(value, "coverage_description"),
    latitude: readNullableNumber(value, "latitude"),
    longitude: readNullableNumber(value, "longitude"),
    verifiedAt: requireString(value, "verified_at"),
    verifiedSourceLabel: requireString(value, "verified_source_label"),
    verifiedSourceUrl: readNullableString(value, "verified_source_url"),
    serviceId: requireString(value, "service_id"),
    serviceName: requireString(value, "service_name"),
    serviceCategory: requireString(value, "service_category"),
    serviceDescription: requireString(value, "service_description"),
    servicePhone: readNullableString(value, "service_phone"),
    serviceWhatsapp: readNullableString(value, "service_whatsapp"),
    serviceArea: requireString(value, "service_area"),
    costType: requireString(value, "cost_type"),
    operatingHours: readNullableString(value, "operating_hours"),
    distanceMeters: readNullableNumber(value, "distance_meters"),
  };
}

export async function GET(
  request: Request,
) {
  try {
    const params = new URL(request.url).searchParams;

    const city =
      readOptionalText(params, "city", 100) ??
      DEFAULT_CITY;

    const categoryInput =
      readOptionalText(params, "category", 40);

    const category =
      categoryInput?.toUpperCase() ?? null;

    if (
      category !== null &&
      !ALLOWED_CATEGORIES.has(category)
    ) {
      throw new InvalidSiagaDirectoryQueryError(
        "Kategori layanan Siaga tidak valid.",
      );
    }

    const search =
      readOptionalText(params, "search", 100);

    const limit = readLimit(params);

    const latitude = readCoordinate(
      params,
      "latitude",
      -90,
      90,
    );

    const longitude = readCoordinate(
      params,
      "longitude",
      -180,
      180,
    );

    if (
      (latitude === null) !==
      (longitude === null)
    ) {
      throw new InvalidSiagaDirectoryQueryError(
        "Latitude dan longitude harus dikirim bersamaan.",
      );
    }

    const supabase =
      await createServerSupabaseClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_public_emergency_directory",
      {
        p_city: city,
        p_category: category,
        p_search: search,
        p_latitude: latitude,
        p_longitude: longitude,
        p_limit: limit,
      },
    );

    if (error) {
      console.error(
        "GET /api/siaga/directory RPC error:",
        error,
      );

      return jsonNoStore(
        {
          message:
            "Direktori layanan Siaga sementara tidak tersedia.",
        },
        503,
      );
    }

    const rpcData: unknown = data;

    if (!Array.isArray(rpcData)) {
      console.error(
        "GET /api/siaga/directory returned an unexpected result shape.",
      );

      return jsonNoStore(
        {
          message:
            "Respons direktori Siaga tidak valid.",
        },
        500,
      );
    }

    const items = rpcData.map(
      (row: unknown) =>
        mapPublicDirectoryItem(row),
    );

    // Lookup media hanya dilakukan untuk organisasi yang sudah lolos
    // RPC direktori publik. Bucket penyimpanan tetap privat.
    const organizationIds = Array.from(
      new Set(items.map((item) => item.organizationId)),
    );
    const profileImageUrlByOrganizationId = new Map<string, string>();

    if (organizationIds.length > 0) {
      const {
        data: organizationMediaRows,
        error: organizationMediaError,
      } = await adminSupabase
        .from("emergency_organizations")
        .select("id, profile_image_path")
        .in("id", organizationIds);

      if (organizationMediaError) {
        // Kegagalan foto tidak boleh menggagalkan direktori layanan.
        console.warn(
          "GET /api/siaga/directory organization image lookup failed:",
          organizationMediaError,
        );
      } else {
        await Promise.all(
          (organizationMediaRows ?? []).map(async (organization) => {
            const storagePath = organization.profile_image_path;

            if (
              typeof storagePath !== "string" ||
              storagePath.trim().length === 0
            ) {
              return;
            }

            const {
              data: signedMedia,
              error: signedMediaError,
            } = await adminSupabase.storage
              .from("emergency-organization-media")
              .createSignedUrl(storagePath, 3600);

            if (
              !signedMediaError &&
              typeof signedMedia?.signedUrl === "string"
            ) {
              profileImageUrlByOrganizationId.set(
                organization.id,
                signedMedia.signedUrl,
              );
            }
          }),
        );
      }
    }

    return jsonNoStore({
      items: items.map((item) => ({
        ...item,
        profileImageUrl:
          profileImageUrlByOrganizationId.get(item.organizationId) ?? null,
      })),
    });
  } catch (error) {
    if (
      error instanceof InvalidSiagaDirectoryQueryError
    ) {
      return jsonNoStore(
        {
          message: error.message,
        },
        400,
      );
    }

    console.error(
      "GET /api/siaga/directory error:",
      error,
    );

    return jsonNoStore(
      {
        message:
          "Gagal mengambil direktori layanan Siaga.",
      },
      500,
    );
  }
}
