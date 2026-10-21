import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";

import {
  requireSiagaApiUser,
  SiagaApiError,
} from "@/features/siaga/server/require-siaga-api-user";

const MAX_REQUEST_BYTES = 64 * 1024;

const ORGANIZATION_TYPES = [
  "AMBULANCE_PROVIDER",
  "HEALTHCARE_FACILITY",
  "DISASTER_RELIEF",
  "SEARCH_AND_RESCUE",
  "COMMUNITY_ORGANIZATION",
  "OTHER",
] as const;

const SERVICE_CATEGORIES = [
  "AMBULANCE",
  "MEDICAL",
  "FIRE_RESCUE",
  "DISASTER_RELIEF",
  "SEARCH_RESCUE",
  "COMMUNITY_SUPPORT",
  "OTHER",
] as const;

const COST_TYPES = [
  "FREE",
  "PAID",
  "DONATION",
  "VARIES",
  "UNKNOWN",
] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface EmergencyOrganizationSubmission {
  organizationName: string;
  organizationType: (typeof ORGANIZATION_TYPES)[number];
  registrationIdentifier: string | null;
  description: string;
  officialPhone: string | null;
  officialWhatsapp: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  publicAddress: string | null;
  district: string | null;
  city: string;
  province: string;
  coverageDescription: string;
  latitude: number | null;
  longitude: number | null;
  coordinatesPublic: boolean;
  serviceName: string;
  serviceCategory: (typeof SERVICE_CATEGORIES)[number];
  serviceDescription: string;
  servicePhone: string | null;
  serviceWhatsapp: string | null;
  serviceArea: string;
  costType: (typeof COST_TYPES)[number];
  operatingHours: string | null;
}

interface OrganizationSubmissionResult {
  organization: {
    id: string;
    verificationStatus: "PENDING";
  };
  service: {
    id: string;
    reviewStatus: "PENDING";
    isActive: false;
  };
  submittedAt: string;
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

class SiagaRequestBodyError extends Error {
  constructor(
    readonly status: 400 | 413,
    message: string,
  ) {
    super(message);
    this.name = "SiagaRequestBodyError";
  }
}

async function readJsonBodyWithinLimit(
  request: Request,
): Promise<unknown> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new SiagaRequestBodyError(
      400,
      "Body permintaan bukan JSON yang valid.",
    );
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The size limit has already been exceeded; cancellation is best-effort.
        }

        throw new SiagaRequestBodyError(
          413,
          "Ukuran permintaan terlalu besar.",
        );
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

  let jsonText: string;

  try {
    jsonText = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new SiagaRequestBodyError(
      400,
      "Body permintaan bukan JSON yang valid.",
    );
  }

  try {
    const parsed: unknown = JSON.parse(jsonText);
    return parsed;
  } catch {
    throw new SiagaRequestBodyError(
      400,
      "Body permintaan bukan JSON yang valid.",
    );
  }
}

function invalidInput(message: string): never {
  throw new SiagaApiError(
    "INVALID_INPUT",
    message,
  );
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

function readRequiredText(
  body: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number,
): string {
  const raw = body[key];

  if (typeof raw !== "string") {
    return invalidInput(
      `${label} wajib diisi.`,
    );
  }

  const value = raw.trim();

  if (
    value.length === 0 ||
    value.length > maxLength ||
    value.includes("\u0000")
  ) {
    return invalidInput(
      `${label} tidak valid atau terlalu panjang.`,
    );
  }

  return value;
}

function readOptionalText(
  body: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number,
): string | null {
  const raw = body[key];

  if (raw === undefined || raw === null) {
    return null;
  }

  if (typeof raw !== "string") {
    return invalidInput(
      `${label} harus berupa teks.`,
    );
  }

  const value = raw.trim();

  if (value.length === 0) {
    return null;
  }

  if (
    value.length > maxLength ||
    value.includes("\u0000")
  ) {
    return invalidInput(
      `${label} tidak valid atau terlalu panjang.`,
    );
  }

  return value;
}

function readRequiredEnum<
  T extends readonly string[],
>(
  body: Record<string, unknown>,
  key: string,
  label: string,
  allowed: T,
): T[number] {
  const value = readRequiredText(
    body,
    key,
    label,
    40,
  ).toUpperCase();

  const match = allowed.find(
    (item) => item === value,
  );

  if (match === undefined) {
    return invalidInput(
      `${label} tidak valid.`,
    );
  }

  return match;
}

function readOptionalEnum<
  T extends readonly string[],
>(
  body: Record<string, unknown>,
  key: string,
  label: string,
  allowed: T,
  defaultValue: T[number],
): T[number] {
  const raw = readOptionalText(
    body,
    key,
    label,
    40,
  );

  if (raw === null) {
    return defaultValue;
  }

  const value = raw.toUpperCase();

  const match = allowed.find(
    (item) => item === value,
  );

  if (match === undefined) {
    return invalidInput(
      `${label} tidak valid.`,
    );
  }

  return match;
}

function readOptionalNumber(
  body: Record<string, unknown>,
  key: string,
  label: string,
  minimum: number,
  maximum: number,
): number | null {
  const raw = body[key];

  if (raw === undefined || raw === null) {
    return null;
  }

  if (
    typeof raw !== "number" ||
    !Number.isFinite(raw) ||
    raw < minimum ||
    raw > maximum
  ) {
    return invalidInput(
      `${label} tidak valid.`,
    );
  }

  return raw;
}

function readOptionalBoolean(
  body: Record<string, unknown>,
  key: string,
  label: string,
): boolean {
  const raw = body[key];

  if (raw === undefined || raw === null) {
    return false;
  }

  if (typeof raw !== "boolean") {
    return invalidInput(
      `${label} harus bernilai true atau false.`,
    );
  }

  return raw;
}

function validateOptionalUrl(
  value: string | null,
  label: string,
): string | null {
  if (value === null) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return invalidInput(
      `${label} harus berupa URL yang valid.`,
    );
  }

  if (
    (parsedUrl.protocol !== "https:" &&
      parsedUrl.protocol !== "http:") ||
    !parsedUrl.hostname ||
    parsedUrl.username.length > 0 ||
    parsedUrl.password.length > 0
  ) {
    return invalidInput(
      `${label} harus menggunakan URL HTTP atau HTTPS yang valid.`,
    );
  }

  return parsedUrl.toString();
}

function parseSubmission(
  value: unknown,
): EmergencyOrganizationSubmission {
  if (!isRecord(value)) {
    return invalidInput(
      "Data pengajuan harus berupa objek JSON.",
    );
  }

  const organizationName = readRequiredText(
    value,
    "organizationName",
    "Nama organisasi",
    200,
  );

  const organizationType = readRequiredEnum(
    value,
    "organizationType",
    "Jenis organisasi",
    ORGANIZATION_TYPES,
  );

  const registrationIdentifier = readOptionalText(
    value,
    "registrationIdentifier",
    "Nomor registrasi",
    150,
  );

  const description = readRequiredText(
    value,
    "description",
    "Deskripsi organisasi",
    3000,
  );

  const officialPhone = readOptionalText(
    value,
    "officialPhone",
    "Telepon organisasi",
    80,
  );

  const officialWhatsapp = readOptionalText(
    value,
    "officialWhatsapp",
    "WhatsApp organisasi",
    80,
  );

  if (
    officialPhone === null &&
    officialWhatsapp === null
  ) {
    return invalidInput(
      "Nomor telepon atau WhatsApp organisasi wajib diisi.",
    );
  }

  const contactEmail = readOptionalText(
    value,
    "contactEmail",
    "Email kontak",
    320,
  );

  if (
    contactEmail !== null &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    return invalidInput(
      "Alamat email tidak valid.",
    );
  }

  const websiteUrl = validateOptionalUrl(
    readOptionalText(
      value,
      "websiteUrl",
      "Website organisasi",
      500,
    ),
    "Website organisasi",
  );

  const publicAddress = readOptionalText(
    value,
    "publicAddress",
    "Alamat publik",
    300,
  );

  const district = readOptionalText(
    value,
    "district",
    "Kecamatan",
    100,
  );

  const city =
    readOptionalText(
      value,
      "city",
      "Kota",
      100,
    ) ?? "Surabaya";

  const province =
    readOptionalText(
      value,
      "province",
      "Provinsi",
      100,
    ) ?? "Jawa Timur";

  const coverageDescription = readRequiredText(
    value,
    "coverageDescription",
    "Cakupan layanan",
    500,
  );

  const latitude = readOptionalNumber(
    value,
    "latitude",
    "Latitude",
    -90,
    90,
  );

  const longitude = readOptionalNumber(
    value,
    "longitude",
    "Longitude",
    -180,
    180,
  );

  if (
    (latitude === null) !==
    (longitude === null)
  ) {
    return invalidInput(
      "Latitude dan longitude harus dikirim bersamaan.",
    );
  }

  const coordinatesPublic = readOptionalBoolean(
    value,
    "coordinatesPublic",
    "Publikasi koordinat",
  );

  if (
    coordinatesPublic &&
    latitude === null
  ) {
    return invalidInput(
      "Koordinat harus diisi sebelum dipublikasikan.",
    );
  }

  const serviceName = readRequiredText(
    value,
    "serviceName",
    "Nama layanan",
    200,
  );

  const serviceCategory = readRequiredEnum(
    value,
    "serviceCategory",
    "Kategori layanan",
    SERVICE_CATEGORIES,
  );

  const serviceDescription = readRequiredText(
    value,
    "serviceDescription",
    "Deskripsi layanan",
    3000,
  );

  const servicePhone = readOptionalText(
    value,
    "servicePhone",
    "Telepon layanan",
    80,
  );

  const serviceWhatsapp = readOptionalText(
    value,
    "serviceWhatsapp",
    "WhatsApp layanan",
    80,
  );

  const serviceArea = readRequiredText(
    value,
    "serviceArea",
    "Area layanan",
    500,
  );

  const costType = readOptionalEnum(
    value,
    "costType",
    "Jenis biaya",
    COST_TYPES,
    "UNKNOWN",
  );

  const operatingHours = readOptionalText(
    value,
    "operatingHours",
    "Jam operasional",
    500,
  );

  return {
    organizationName,
    organizationType,
    registrationIdentifier,
    description,
    officialPhone,
    officialWhatsapp,
    contactEmail,
    websiteUrl,
    publicAddress,
    district,
    city,
    province,
    coverageDescription,
    latitude,
    longitude,
    coordinatesPublic,
    serviceName,
    serviceCategory,
    serviceDescription,
    servicePhone,
    serviceWhatsapp,
    serviceArea,
    costType,
    operatingHours,
  };
}

function parseSubmissionResult(
  value: unknown,
): OrganizationSubmissionResult {
  if (
    !Array.isArray(value) ||
    value.length !== 1 ||
    !isRecord(value[0])
  ) {
    throw new Error(
      "INVALID_SIAGA_SUBMISSION_RESULT",
    );
  }

  const row = value[0];

  const organizationId =
    row.result_organization_id;

  const organizationStatus =
    row.result_organization_status;

  const serviceId =
    row.result_service_id;

  const serviceStatus =
    row.result_service_status;

  const submittedAt =
    row.result_submitted_at;

  if (
    typeof organizationId !== "string" ||
    !UUID_PATTERN.test(organizationId) ||
    organizationStatus !== "PENDING" ||
    typeof serviceId !== "string" ||
    !UUID_PATTERN.test(serviceId) ||
    serviceStatus !== "PENDING" ||
    typeof submittedAt !== "string" ||
    !Number.isFinite(Date.parse(submittedAt))
  ) {
    throw new Error(
      "INVALID_SIAGA_SUBMISSION_RESULT",
    );
  }

  return {
    organization: {
      id: organizationId,
      verificationStatus: "PENDING",
    },
    service: {
      id: serviceId,
      reviewStatus: "PENDING",
      isActive: false,
    },
    submittedAt,
  };
}

function createRpcErrorResponse(
  errorCode: string,
): NextResponse {
  console.error(
    "POST /api/siaga/provider/organizations RPC failed:",
    errorCode,
  );

  switch (errorCode) {
    case "22023":
    case "22001":
    case "23502":
    case "23514":
      return jsonNoStore(
        {
          message:
            "Data pengajuan tidak valid.",
        },
        400,
      );

    case "42501":
      return jsonNoStore(
        {
          message:
            "Akun tidak memiliki izin untuk mengajukan organisasi.",
        },
        403,
      );

    case "P0002":
      return jsonNoStore(
        {
          message:
            "Data yang diperlukan tidak ditemukan.",
        },
        404,
      );

    case "55000":
      return jsonNoStore(
        {
          message:
            "Pengajuan tidak dapat diproses pada status akun saat ini.",
        },
        409,
      );

    default:
      return jsonNoStore(
        {
          message:
            "Layanan pendaftaran Siaga sementara tidak tersedia.",
        },
        503,
      );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const user = await requireSiagaApiUser(
      request,
    );

    const contentType =
      request.headers.get("content-type");

    if (
      !contentType ||
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      return jsonNoStore(
        {
          message:
            "Content-Type harus application/json.",
        },
        415,
      );
    }

    const contentLength =
      request.headers.get("content-length");

    if (
      contentLength !== null &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > MAX_REQUEST_BYTES
    ) {
      return jsonNoStore(
        {
          message:
            "Ukuran permintaan terlalu besar.",
        },
        413,
      );
    }

    let body: unknown;

    try {
      body = await readJsonBodyWithinLimit(request);
    } catch (error) {
      if (error instanceof SiagaRequestBodyError) {
        return jsonNoStore(
          {
            message: error.message,
          },
          error.status,
        );
      }

      return jsonNoStore(
        {
          message:
            "Body permintaan bukan JSON yang valid.",
        },
        400,
      );
    }

    const input = parseSubmission(body);

    const {
      data,
      error,
    } = await adminSupabase.rpc(
      "submit_emergency_organization",
      {
        p_actor_user_id: user.id,
        p_organization_name: input.organizationName,
        p_organization_type: input.organizationType,
        p_registration_identifier: input.registrationIdentifier,
        p_description: input.description,
        p_official_phone: input.officialPhone,
        p_official_whatsapp: input.officialWhatsapp,
        p_contact_email: input.contactEmail,
        p_website_url: input.websiteUrl,
        p_public_address: input.publicAddress,
        p_district: input.district,
        p_city: input.city,
        p_province: input.province,
        p_coverage_description: input.coverageDescription,
        p_latitude: input.latitude,
        p_longitude: input.longitude,
        p_coordinates_public: input.coordinatesPublic,
        p_service_name: input.serviceName,
        p_service_category: input.serviceCategory,
        p_service_description: input.serviceDescription,
        p_service_phone: input.servicePhone,
        p_service_whatsapp: input.serviceWhatsapp,
        p_service_area: input.serviceArea,
        p_cost_type: input.costType,
        p_operating_hours: input.operatingHours,
      },
    );

    if (error) {
      return createRpcErrorResponse(
        error.code,
      );
    }

    const result = parseSubmissionResult(
      data,
    );

    return jsonNoStore(
      result,
      201,
    );
  } catch (error) {
    if (error instanceof SiagaApiError) {
      return jsonNoStore(
        {
          message: error.message,
        },
        error.code === "UNAUTHORIZED"
          ? 401
          : 400,
      );
    }

    console.error(
      "POST /api/siaga/provider/organizations failed:",
      error instanceof Error
        ? error.name
        : "Unknown error",
    );

    return jsonNoStore(
      {
        message:
          "Gagal memproses pendaftaran organisasi Siaga.",
      },
      500,
    );
  }
}

export async function GET(
  request: Request,
): Promise<NextResponse> {
  try {
    const user = await requireSiagaApiUser(request);

    const {
      data: organizations,
      error: organizationError,
    } = await adminSupabase
      .from("emergency_organizations")
      .select(
        "id, organization_name, organization_type, registration_identifier, description, official_phone, official_whatsapp, contact_email, website_url, public_address, district, city, province, coverage_description, latitude, longitude, coordinates_public, profile_image_path, cover_image_path, verification_status, created_at, updated_at",
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (organizationError) {
      console.error(
        "GET /api/siaga/provider/organizations organization query failed:",
        organizationError.code,
      );

      const unavailableCodes = [
        "42P01",
        "PGRST204",
        "PGRST205",
      ];

      return jsonNoStore(
        {
          message:
            "Data organisasi Siaga sementara tidak tersedia.",
        },
        unavailableCodes.includes(organizationError.code)
          ? 503
          : 500,
      );
    }

    const organizationRows = organizations ?? [];

    if (organizationRows.length === 0) {
      return jsonNoStore({ items: [] });
    }

    const organizationIds = organizationRows.map(
      (organization) => organization.id,
    );

    const {
      data: services,
      error: serviceError,
    } = await adminSupabase
      .from("emergency_provider_services")
      .select(
        "id, organization_id, name, category, description, public_phone, public_whatsapp, service_area, cost_type, operating_hours, review_status, is_active, created_at, updated_at",
      )
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false });

    if (serviceError) {
      console.error(
        "GET /api/siaga/provider/organizations service query failed:",
        serviceError.code,
      );

      const unavailableCodes = [
        "42P01",
        "PGRST204",
        "PGRST205",
      ];

      return jsonNoStore(
        {
          message:
            "Data layanan Siaga sementara tidak tersedia.",
        },
        unavailableCodes.includes(serviceError.code)
          ? 503
          : 500,
      );
    }

    const serviceRows = services ?? [];

    const signedMediaByOrganizationId = new Map<
      string,
      { profileImageUrl: string; coverImageUrl: string }
    >();

    await Promise.all(
      organizationRows.map(async (organization) => {
        const [profileResult, coverResult] = await Promise.all([
          typeof organization.profile_image_path === "string" && organization.profile_image_path
            ? adminSupabase.storage
                .from("emergency-organization-media")
                .createSignedUrl(organization.profile_image_path, 3600)
            : Promise.resolve(null),
          typeof organization.cover_image_path === "string" && organization.cover_image_path
            ? adminSupabase.storage
                .from("emergency-organization-media")
                .createSignedUrl(organization.cover_image_path, 3600)
            : Promise.resolve(null),
        ]);

        signedMediaByOrganizationId.set(organization.id, {
          profileImageUrl: profileResult && !profileResult.error
            ? profileResult.data.signedUrl
            : "",
          coverImageUrl: coverResult && !coverResult.error
            ? coverResult.data.signedUrl
            : "",
        });
      }),
    );

    return jsonNoStore({
      items: organizationRows.map((organization) => ({
        id: organization.id,
        organizationName: organization.organization_name,
        organizationType: organization.organization_type,
        registrationIdentifier: organization.registration_identifier,
        officialPhone: organization.official_phone,
        officialWhatsapp: organization.official_whatsapp,
        contactEmail: organization.contact_email,
        websiteUrl: organization.website_url,
        publicAddress: organization.public_address,
        district: organization.district,
        coverageDescription: organization.coverage_description,
        latitude: organization.latitude,
        longitude: organization.longitude,
        coordinatesPublic: organization.coordinates_public,
        description: organization.description,
        city: organization.city,
        province: organization.province,
        verificationStatus: organization.verification_status,
        profileImageUrl: signedMediaByOrganizationId.get(organization.id)?.profileImageUrl ?? "",
        coverImageUrl: signedMediaByOrganizationId.get(organization.id)?.coverImageUrl ?? "",
        createdAt: organization.created_at,
        updatedAt: organization.updated_at,
        services: serviceRows
          .filter(
            (service) =>
              service.organization_id === organization.id,
          )
          .map((service) => ({
            id: service.id,
            name: service.name,
            category: service.category,
            description: service.description,
            publicPhone: service.public_phone,
            publicWhatsapp: service.public_whatsapp,
            serviceArea: service.service_area,
            costType: service.cost_type,
            operatingHours: service.operating_hours,
            reviewStatus: service.review_status,
            isActive: service.is_active,
            createdAt: service.created_at,
            updatedAt: service.updated_at,
          })),
      })),
    });
  } catch (error) {
    if (error instanceof SiagaApiError) {
      return jsonNoStore(
        {
          message: error.message,
        },
        error.code === "UNAUTHORIZED" ? 401 : 400,
      );
    }

    console.error(
      "GET /api/siaga/provider/organizations failed:",
      error instanceof Error ? error.name : "Unknown error",
    );

    return jsonNoStore(
      {
        message:
          "Gagal mengambil organisasi penyedia Siaga.",
      },
      500,
    );
  }
}
