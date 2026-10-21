import { NextResponse } from "next/server";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latitudeValues = params.getAll("latitude");
  const longitudeValues = params.getAll("longitude");

  if (
    latitudeValues.length !== 1 ||
    longitudeValues.length !== 1 ||
    !latitudeValues[0].trim() ||
    !longitudeValues[0].trim()
  ) {
    return jsonNoStore({ label: null, message: "Koordinat tidak valid." }, 400);
  }

  const latitude = Number(latitudeValues[0]);
  const longitude = Number(longitudeValues[0]);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return jsonNoStore({ label: null, message: "Koordinat di luar rentang." }, 400);
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();

  if (!apiKey) {
    return jsonNoStore({ label: null }, 503);
  }

  try {
    const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("format", "json");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return jsonNoStore({ label: null }, 502);
    }

    const payload: unknown = await response.json();

    if (!isRecord(payload) || !Array.isArray(payload.results)) {
      return jsonNoStore({ label: null }, 502);
    }

    const result = payload.results.find(isRecord);

    if (!result) {
      return jsonNoStore({ label: "Lokasi aktif" });
    }

    const properties =
      isRecord(result.properties) ? result.properties : result;

    const city = firstString(properties, [
      "city",
      "town",
      "village",
      "municipality",
    ]);

    const label = city ?? "Lokasi aktif";

    return jsonNoStore({ label });
  } catch {
    return jsonNoStore({ label: null }, 502);
  }
}