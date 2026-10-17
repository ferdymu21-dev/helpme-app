import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_LATITUDE = -7.2575;
const DEFAULT_LONGITUDE = 112.7521;
const SEARCH_RADIUS_METERS = 10000;
const MAX_RESULTS = 100;

const GEOAPIFY_ENDPOINT = "https://api.geoapify.com/v2/places";

const CATEGORY_VALUES = [
  "ALL",
  "AMBULANCE_MEDICAL",
  "AMBULANCE",
  "MEDICAL",
  "FIRE_RESCUE",
  "SECURITY",
  "COMMUNITY_SUPPORT",
  "DISASTER_RELIEF",
  "SEARCH_RESCUE",
  "OTHER",
] as const;

type PlaceCategory = (typeof CATEGORY_VALUES)[number];

type MappedCategory =
  | "AMBULANCE"
  | "MEDICAL"
  | "FIRE_RESCUE"
  | "SECURITY"
  | "COMMUNITY_SUPPORT";



interface PublicMapPlace {
  id: string;
  name: string;
  category: MappedCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  openingHours: string | null;
  source: "GEOAPIFY";
  sourceLabel: "Data Geoapify · OpenStreetMap";
  sourceUrl: string | null;
  verifiedByHelpMe: false;
}

function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSingleParameter(
  params: URLSearchParams,
  name: string,
): string | null {
  const values = params.getAll(name);

  if (values.length > 1) {
    throw new Error(`Parameter "${name}" hanya boleh dikirim satu kali.`);
  }

  return values[0] ?? null;
}

function readCategory(params: URLSearchParams): PlaceCategory {
  const raw = readSingleParameter(params, "category")?.trim().toUpperCase()
    ?? "ALL";

  const match = CATEGORY_VALUES.find((value) => value === raw);

  if (!match) {
    throw new Error("Kategori pencarian tempat tidak valid.");
  }

  return match;
}

function readSearch(params: URLSearchParams): string {
  const raw = readSingleParameter(params, "search");

  if (raw === null) {
    return "";
  }

  const value = raw.trim();

  if (value.length > 100 || /[\u0000-\u001F\u007F]/.test(value)) {
    throw new Error("Kata kunci pencarian tidak valid.");
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

  const valueText = raw.trim();

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(valueText)) {
    throw new Error(`Parameter "${name}" harus berupa angka yang valid.`);
  }

  const value = Number(valueText);

  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`Parameter "${name}" berada di luar rentang yang valid.`);
  }

  return value;
}

function geoapifyCategories(category: PlaceCategory): string[] {
  switch (category) {
    case "ALL":
      return [
        "healthcare.hospital",
        "healthcare.clinic_or_praxis",
        "emergency.ambulance_station",
        "service.fire_station",
        "service.police",
        "activity.community_center",
      ];
    case "AMBULANCE_MEDICAL":
      return [
        "healthcare.hospital",
        "healthcare.clinic_or_praxis",
        "emergency.ambulance_station",
      ];
    case "AMBULANCE":
      return ["emergency.ambulance_station"];
    case "MEDICAL":
      return ["healthcare.hospital", "healthcare.clinic_or_praxis"];
    case "FIRE_RESCUE":
      return ["service.fire_station"];
    case "SECURITY":
      return ["service.police"];
    case "COMMUNITY_SUPPORT":
      return ["activity.community_center"];
    case "DISASTER_RELIEF":
    case "SEARCH_RESCUE":
    case "OTHER":
      return [];
  }
}


function inferSearchCategories(search: string): string[] | null {
  const normalized = search
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (
    /\b(ambulans|ambulance|ambulan)\b/.test(normalized)
  ) {
    return ["emergency.ambulance_station"];
  }

  if (
    /\b(pemadam|kebakaran|damkar|fire station)\b/.test(normalized)
  ) {
    return ["service.fire_station"];
  }

  if (
    /\b(polisi|polsek|polres|kepolisian|kantor polisi)\b/.test(normalized)
  ) {
    return ["service.police"];
  }

  if (
    /\b(rumah sakit|rsud|rs|klinik|puskesmas|dokter|medis|kesehatan|hospital)\b/.test(
      normalized,
    )
  ) {
    return ["healthcare.hospital", "healthcare.clinic_or_praxis"];
  }

  if (
    /\b(balai warga|balai masyarakat|pusat komunitas|community center)\b/.test(
      normalized,
    )
  ) {
    return ["activity.community_center"];
  }

  return null;
}

function inferMappedCategory(
  categories: string[],
): MappedCategory | null {
  if (categories.some((item) => item === "emergency.ambulance_station")) {
    return "AMBULANCE";
  }
  if (categories.some((item) => item === "service.fire_station")) {
    return "FIRE_RESCUE";
  }
  if (categories.some((item) => item === "service.police")) {
    return "SECURITY";
  }
  if (categories.some((item) => item === "activity.community_center")) {
    return "COMMUNITY_SUPPORT";
  }
  if (
    categories.some(
      (item) =>
        item === "healthcare.hospital" ||
        item === "healthcare.clinic_or_praxis" ||
        item.startsWith("healthcare."),
    )
  ) {
    return "MEDICAL";
  }
  return null;
}

function readStringValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapPlace(value: unknown): PublicMapPlace | null {
  if (!isRecord(value) || !isRecord(value.properties)) {
    return null;
  }

  const properties = value.properties;
  const datasource = isRecord(properties.datasource)
    ? properties.datasource
    : null;
  const raw = datasource && isRecord(datasource.raw)
    ? datasource.raw
    : null;
  const contact = isRecord(properties.contact) ? properties.contact : null;

  const name = readStringValue(properties, "name");
  const rawCategories = properties.categories;
  const categories = Array.isArray(rawCategories)
    ? rawCategories.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const geometry = isRecord(value.geometry) ? value.geometry : null;
  const coordinates =
    geometry && Array.isArray(geometry.coordinates)
      ? geometry.coordinates
      : null;

  const longitude =
    typeof properties.lon === "number"
      ? properties.lon
      : coordinates && typeof coordinates[0] === "number"
        ? coordinates[0]
        : null;
  const latitude =
    typeof properties.lat === "number"
      ? properties.lat
      : coordinates && typeof coordinates[1] === "number"
        ? coordinates[1]
        : null;

  if (
    !name ||
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const category = inferMappedCategory(categories);
  if (!category) {
    return null;
  }

  const osmType = raw ? readStringValue(raw, "osm_type") : null;
  const osmId = raw ? raw.osm_id : null;
  const validOsmType =
    osmType === "node" || osmType === "way" || osmType === "relation";
  const sourceUrl =
    validOsmType &&
    (typeof osmId === "number" || typeof osmId === "string") &&
    /^\d+$/.test(String(osmId)) &&
    Number(osmId) > 0
      ? `https://www.openstreetmap.org/${osmType}/${osmId}`
      : null;

  const id =
    readStringValue(properties, "place_id") ??
    (typeof value.id === "string" ? value.id : null);

  if (!id) {
    return null;
  }

  return {
    id: `geoapify:${id}`,
    name,
    category,
    latitude,
    longitude,
    address: readStringValue(properties, "formatted"),
    phone: contact ? readStringValue(contact, "phone") : null,
    websiteUrl: readStringValue(properties, "website"),
    openingHours: readStringValue(properties, "opening_hours"),
    source: "GEOAPIFY",
    sourceLabel: "Data Geoapify · OpenStreetMap",
    sourceUrl,
    verifiedByHelpMe: false,
  };
}
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const category = readCategory(params);
    const search = readSearch(params);
    const requestedLatitude = readCoordinate(params, "latitude", -90, 90);
    const requestedLongitude = readCoordinate(params, "longitude", -180, 180);

    if ((requestedLatitude === null) !== (requestedLongitude === null)) {
      return jsonNoStore(
        { message: "Latitude dan longitude harus dikirim bersamaan." },
        400,
      );
    }

    const latitude = requestedLatitude ?? DEFAULT_LATITUDE;
    const longitude = requestedLongitude ?? DEFAULT_LONGITUDE;

const inferredCategories = inferSearchCategories(search);
const selectedCategories = geoapifyCategories(category);

const inferredCategoryAllowed =
  category === "ALL" ||
  (category === "AMBULANCE_MEDICAL" &&
    inferredCategories?.every((item) =>
      [
        "healthcare.hospital",
        "healthcare.clinic_or_praxis",
        "emergency.ambulance_station",
      ].includes(item),
    )) ||
  (category === "AMBULANCE" &&
    inferredCategories?.every(
      (item) => item === "emergency.ambulance_station",
    )) ||
  (category === "MEDICAL" &&
    inferredCategories?.every((item) =>
      ["healthcare.hospital", "healthcare.clinic_or_praxis"].includes(item),
    )) ||
  (category === "FIRE_RESCUE" &&
    inferredCategories?.every((item) => item === "service.fire_station")) ||
  (category === "SECURITY" &&
    inferredCategories?.every((item) => item === "service.police")) ||
  (category === "COMMUNITY_SUPPORT" &&
    inferredCategories?.every((item) => item === "activity.community_center"));

const categories =
  inferredCategories && inferredCategoryAllowed
    ? inferredCategories
    : selectedCategories;
if (categories.length === 0) {
  return jsonNoStore({
    items: [],
    source: "GEOAPIFY",
    supported: false,
    radiusMeters: SEARCH_RADIUS_METERS,
    message:
      "Kategori ini belum dipetakan ke sumber tempat umum. Direktori mitra HelpMe tetap menjadi sumber terpisah.",
  });
}

    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      console.error("GET /api/siaga/places: GEOAPIFY_API_KEY is not configured.");
      return jsonNoStore(
        {
          items: [],
          source: "GEOAPIFY",
          supported: true,
          message: "Pencarian tempat umum sementara tidak tersedia.",
        },
        503,
      );
    }

    const url = new URL(GEOAPIFY_ENDPOINT);
    url.searchParams.set("categories", categories.join(","));
    url.searchParams.set(
      "filter",
      `circle:${longitude},${latitude},${SEARCH_RADIUS_METERS}`,
    );
    url.searchParams.set("limit", String(MAX_RESULTS));
    url.searchParams.set("lang", "id");
    if (search && inferredCategories === null) {
      url.searchParams.set("name", search);
    }
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("GET /api/siaga/places Geoapify failed:", response.status);
      return jsonNoStore(
        {
          items: [],
          source: "GEOAPIFY",
          supported: true,
          message: "Pencarian tempat umum sementara tidak tersedia.",
        },
        503,
      );
    }

    const payload: unknown = await response.json();
    if (
      !isRecord(payload) ||
      !Array.isArray(payload.features)
    ) {
      console.error("GET /api/siaga/places received an invalid Geoapify response.");
      return jsonNoStore(
        {
          items: [],
          source: "GEOAPIFY",
          supported: true,
          message: "Respons sumber peta tidak valid.",
        },
        503,
      );
    }

    const uniquePlaces = new Map<string, PublicMapPlace>();
    for (const feature of payload.features.slice(0, MAX_RESULTS)) {
      const place = mapPlace(feature);
      if (!place) continue;

      const key = [
        place.name.toLocaleLowerCase("id-ID"),
        place.latitude.toFixed(4),
        place.longitude.toFixed(4),
      ].join("|");

      if (!uniquePlaces.has(key)) {
        uniquePlaces.set(key, place);
      }
      if (uniquePlaces.size >= MAX_RESULTS) break;
    }

    return jsonNoStore({
      items: [...uniquePlaces.values()],
      source: "GEOAPIFY",
      supported: true,
      radiusMeters: SEARCH_RADIUS_METERS,
      center: { latitude, longitude },
      attribution: "© Geoapify | © OpenStreetMap contributors",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      return jsonNoStore(
        {
          items: [],
          source: "GEOAPIFY",
          message: "Pencarian tempat melewati batas waktu. Silakan coba lagi.",
        },
        503,
      );
    }

    if (error instanceof Error) {
      return jsonNoStore({ message: error.message }, 400);
    }

    console.error("GET /api/siaga/places failed.");
    return jsonNoStore(
      {
        items: [],
        source: "GEOAPIFY",
        message: "Gagal mengambil tempat dari sumber peta.",
      },
      500,
    );
  }
}
