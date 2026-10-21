import { NextResponse } from "next/server";

import {
  requireSiagaApiUser,
  SiagaApiError,
} from "@/features/siaga/server/require-siaga-api-user";

export const runtime = "nodejs";

const SEARCH_ENDPOINT = "https://api.geoapify.com/v1/geocode/search";
const REVERSE_ENDPOINT = "https://api.geoapify.com/v1/geocode/reverse";
const DEFAULT_LATITUDE = -7.2575;
const DEFAULT_LONGITUDE = 112.7521;

interface LocationResult {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string | null;
  district: string | null;
  province: string | null;
}

class LocationRequestError extends Error {}

function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function singleParam(params: URLSearchParams, name: string): string | null {
  const values = params.getAll(name);

  if (values.length > 1) {
    throw new LocationRequestError(`Parameter ${name} tidak boleh berulang.`);
  }

  return values[0] ?? null;
}

function readCoordinate(
  params: URLSearchParams,
  name: "latitude" | "longitude",
  minimum: number,
  maximum: number,
): number | null {
  const raw = singleParam(params, name);

  if (raw === null || raw.trim() === "") {
    return null;
  }

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw.trim())) {
    throw new LocationRequestError(`Parameter ${name} harus berupa angka.`);
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new LocationRequestError(`Parameter ${name} berada di luar rentang valid.`);
  }

  return value;
}

function optionalText(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function parseResults(payload: unknown): LocationResult[] {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    return [];
  }

  const items: LocationResult[] = [];

  payload.results.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const properties = isRecord(entry.properties) ? entry.properties : {};
    const record: Record<string, unknown> = { ...entry, ...properties };

    const latitude = record.lat;
    const longitude = record.lon;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return;
    }

    const address =
      optionalText(record, ["formatted", "address_line1", "name"]) ?? "";

    if (!address) {
      return;
    }

    items.push({
      id:
        optionalText(record, ["place_id"]) ??
        `${latitude.toFixed(6)}:${longitude.toFixed(6)}:${index}`,
      address,
      latitude,
      longitude,
      city: optionalText(record, ["city", "municipality", "town"]),
      district: optionalText(record, [
        "district",
        "suburb",
        "neighbourhood",
        "quarter",
      ]),
      province: optionalText(record, ["state", "province"]),
    });
  });

  return items;
}

export async function GET(request: Request) {
  try {
    await requireSiagaApiUser(request);
  } catch (error) {
    if (error instanceof SiagaApiError) {
      return jsonNoStore(
        { message: error.message },
        error.code === "UNAUTHORIZED" ? 401 : 400,
      );
    }

    console.error("Siaga location API authentication failed.");
    return jsonNoStore(
      { message: "Sesi pengguna tidak dapat divalidasi." },
      500,
    );
  }

  try {
    const params = new URL(request.url).searchParams;
    const mode = singleParam(params, "mode");
    const latitude = readCoordinate(params, "latitude", -90, 90);
    const longitude = readCoordinate(params, "longitude", -180, 180);

    if ((latitude === null) !== (longitude === null)) {
      throw new LocationRequestError(
        "Latitude dan longitude harus dikirim bersamaan.",
      );
    }

    if (mode !== "search" && mode !== "reverse") {
      throw new LocationRequestError("Mode pencarian lokasi tidak valid.");
    }

    if (mode === "reverse" && latitude === null) {
      throw new LocationRequestError("Titik lokasi belum dipilih.");
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      console.error("GEOAPIFY_API_KEY is not configured.");
      return jsonNoStore(
        { message: "Layanan pencarian lokasi belum dikonfigurasi." },
        503,
      );
    }

    const endpoint = mode === "search" ? SEARCH_ENDPOINT : REVERSE_ENDPOINT;
    const url = new URL(endpoint);

    url.searchParams.set("format", "json");
    url.searchParams.set("lang", "id");
    url.searchParams.set("limit", mode === "search" ? "5" : "1");
    url.searchParams.set("apiKey", apiKey);

    if (mode === "search") {
      const query = singleParam(params, "q")?.trim() ?? "";

      if (
        query.length < 3 ||
        query.length > 150 ||
        /[\u0000-\u001F\u007F]/.test(query)
      ) {
        throw new LocationRequestError(
          "Masukkan nama tempat atau alamat minimal 3 karakter.",
        );
      }

      url.searchParams.set("text", query);
      url.searchParams.set("filter", "countrycode:id");
      url.searchParams.set(
        "bias",
        `proximity:${longitude ?? DEFAULT_LONGITUDE},${latitude ?? DEFAULT_LATITUDE}`,
      );
    } else {
      url.searchParams.set("lat", String(latitude));
      url.searchParams.set("lon", String(longitude));
    }

    const upstream = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      console.error("Geoapify geocoding request failed:", upstream.status);

      return jsonNoStore(
        {
          message:
            upstream.status === 429
              ? "Pencarian lokasi mencapai batas permintaan. Coba lagi nanti."
              : "Pencarian alamat belum berhasil. Silakan coba lagi.",
        },
        upstream.status === 429 ? 503 : 502,
      );
    }

    const payload: unknown = await upstream.json();

    return jsonNoStore({ items: parseResults(payload) });
  } catch (error) {
    if (error instanceof LocationRequestError) {
      return jsonNoStore({ message: error.message }, 400);
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      return jsonNoStore(
        { message: "Pencarian lokasi terlalu lama. Silakan coba lagi." },
        504,
      );
    }

    console.error("Siaga location geocoding request failed.");
    return jsonNoStore(
      { message: "Layanan pencarian lokasi sementara tidak tersedia." },
      502,
    );
  }
}