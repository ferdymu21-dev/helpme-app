"use client";

import "leaflet/dist/leaflet.css";

import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { supabase } from "@/lib/supabase/client";

interface LocationResult {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string | null;
  district: string | null;
  province: string | null;
}

interface ProviderLocationPickerProps {
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  district: string;
  province: string;
  title?: string;
  mapHeight?: string;
  onConfirm: (location: LocationResult) => void;
  onLocationChange?: () => void;
}

const SURABAYA_CENTER: [number, number] = [-7.2575, 112.7521];

const locationIcon = divIcon({
  className: "helpme-provider-location-marker",
  html: '<span style="display:block;width:22px;height:22px;border:3px solid white;border-radius:50%;background:#4f46e5;box-shadow:0 2px 8px rgba(15,23,42,.4)"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readLocation(value: unknown): LocationResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, address, latitude, longitude, city, district, province } = value;

  if (
    typeof address !== "string" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    id: typeof id === "string" ? id : `${latitude}:${longitude}`,
    address,
    latitude,
    longitude,
    city: typeof city === "string" ? city : null,
    district: typeof district === "string" ? district : null,
    province: typeof province === "string" ? province : null,
  };
}

async function requestLocations(
  params: URLSearchParams,
): Promise<LocationResult[]> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Sesi login berakhir. Silakan login kembali.");
  }

  const response = await fetch(
    `/api/siaga/provider/location?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
  );

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Pencarian lokasi gagal.";

    throw new Error(message);
  }

  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new Error("Format hasil pencarian lokasi tidak valid.");
  }

  return payload.items
    .map(readLocation)
    .filter((item): item is LocationResult => item !== null);
}

function MapViewport({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.setView(
        [latitude, longitude],
        Math.max(map.getZoom(), 15),
      );
    } else {
      map.setView(SURABAYA_CENTER, 12);
    }
  }, [map, latitude, longitude]);

  return null;
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      void onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function ProviderLocationPicker({
  latitude,
  longitude,
  address,
  city,
  district,
  province,
  title = "Lokasi penyedia layanan",
  mapHeight = "h-80",
  onConfirm,
  onLocationChange,
}: ProviderLocationPickerProps) {
  const initialLatitude = Number(latitude);
  const initialLongitude = Number(longitude);

  const hasInitialCoordinates =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(initialLatitude) &&
    Number.isFinite(initialLongitude) &&
    initialLatitude >= -90 &&
    initialLatitude <= 90 &&
    initialLongitude >= -180 &&
    initialLongitude <= 180;

  const [query, setQuery] = useState(address);
  const [draft, setDraft] = useState<LocationResult | null>(() =>
    hasInitialCoordinates
      ? {
          id: "current-location",
          address,
          latitude: initialLatitude,
          longitude: initialLongitude,
          city: city || null,
          district: district || null,
          province: province || null,
        }
      : null,
  );

  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [message, setMessage] = useState("");
  const requestNumber = useRef(0);

  const chooseMapPoint = useCallback(
    async (pointLatitude: number, pointLongitude: number) => {
      onLocationChange?.();
      const requestId = ++requestNumber.current;

      setDraft({
        id: `point-${pointLatitude.toFixed(6)}-${pointLongitude.toFixed(6)}`,
        address: "",
        latitude: pointLatitude,
        longitude: pointLongitude,
        city: null,
        district: null,
        province: null,
      });

      setQuery("");
      setResults([]);
      setResolvingAddress(true);
      setMessage("Titik dipilih. Sedang mencari alamat...");

      try {
        const params = new URLSearchParams({
          mode: "reverse",
          latitude: String(pointLatitude),
          longitude: String(pointLongitude),
        });

        const locations = await requestLocations(params);

        if (requestId !== requestNumber.current) {
          return;
        }

        const resolved = locations[0];

        if (resolved) {
          setDraft({
            ...resolved,
            latitude: pointLatitude,
            longitude: pointLongitude,
          });
          setQuery(resolved.address);
          setMessage("Alamat ditemukan. Periksa titik lalu konfirmasi lokasi.");
        } else {
          setMessage(
            "Alamat tidak ditemukan. Titik koordinat tetap bisa dikonfirmasi.",
          );
        }
      } catch (error) {
        if (requestId === requestNumber.current) {
          setMessage(
            error instanceof Error
              ? `${error.message} Titik koordinat tetap bisa digunakan.`
              : "Alamat belum dapat ditemukan. Titik koordinat tetap bisa digunakan.",
          );
        }
      } finally {
        if (requestId === requestNumber.current) {
          setResolvingAddress(false);
        }
      }
    },
    [onLocationChange],
  );

  const searchLocations = async () => {
    const value = query.trim();

    if (value.length < 3) {
      setMessage("Ketik minimal 3 karakter untuk mencari lokasi.");
      return;
    }

    onLocationChange?.();

    const requestId = ++requestNumber.current;
    setSearching(true);
    setResults([]);
    setMessage("");

    try {
      const params = new URLSearchParams({
        mode: "search",
        q: value,
      });

      if (draft) {
        params.set("latitude", String(draft.latitude));
        params.set("longitude", String(draft.longitude));
      }

      const locations = await requestLocations(params);

      if (requestId !== requestNumber.current) {
        return;
      }

      setResults(locations);
      setMessage(
        locations.length > 0
          ? "Pilih hasil yang paling sesuai dengan lokasi penyedia."
          : "Lokasi tidak ditemukan. Coba nama tempat atau alamat yang lebih lengkap.",
      );
    } catch (error) {
      if (requestId === requestNumber.current) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Pencarian lokasi gagal.",
        );
      }
    } finally {
      if (requestId === requestNumber.current) {
        setSearching(false);
      }
    }
  };

  const confirmLocation = () => {
    if (!draft) {
      setMessage(
        "Cari alamat atau pilih titik langsung pada peta terlebih dahulu.",
      );
      return;
    }

    onConfirm(draft);
    setMessage("Lokasi dikonfirmasi. Koordinat terisi otomatis.");
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-[12px] leading-4 text-slate-600">
          Pilih lokasi pada peta atau cari alamat di bawah.
        </p>
      </div>
      <div
        className={`relative ${mapHeight} overflow-hidden rounded-xl border border-slate-200 bg-slate-100`}
      >
        <div className="pointer-events-none absolute left-15 top-3 z-1000 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 text-[10px] text-slate-700 shadow-sm">
          <MapPin className="h-3 w-3 text-indigo-600" />
          Ketuk peta untuk menempatkan pin
        </div>
        <MapContainer
          center={SURABAYA_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          className="z-0 h-full w-full"
        >
          <TileLayer
            attribution={
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewport
            latitude={draft?.latitude ?? null}
            longitude={draft?.longitude ?? null}
          />

          <MapClickHandler onSelect={chooseMapPoint} />

          {draft && (
            <Marker
              position={[draft.latitude, draft.longitude]}
              icon={locationIcon}
              draggable
              eventHandlers={{
                dragend(event) {
                  const marker = event.target as LeafletMarker;
                  const point = marker.getLatLng();
                  void chooseMapPoint(point.lat, point.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-white p-1.5 pl-3 transition focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
        <input
          type="search"
          value={query}
          maxLength={150}
          onChange={(event) => {
            onLocationChange?.();
            setQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void searchLocations();
            }
          }}
          placeholder="Cari nama tempat, jalan, atau alamat..."
          aria-label="Cari alamat atau nama tempat"
          className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[12px] text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
        />
        <button
          type="button"
          disabled={searching}
          onClick={() => void searchLocations()}
          aria-label="Cari lokasi"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>
      {results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {results.map((result) => (
            <button
              type="button"
              key={result.id}
              onClick={() => {
                requestNumber.current += 1;
                onLocationChange?.();
                setResolvingAddress(false);
                setDraft(result);
                setQuery(result.address);
                setResults([]);
                setMessage(
                  "Hasil dipilih. Periksa posisi pin dan konfirmasi lokasi.",
                );
              }}
              className="flex w-full items-start gap-3 border-b border-slate-100 p-3 text-left last:border-b-0 hover:bg-indigo-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <span className="text-sm leading-5 text-slate-700">
                {result.address}
              </span>
            </button>
          ))}
        </div>
      )}{" "}
      {draft ? (
        <div className="rounded-xl border border-indigo-100 bg-white p-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-900">
                Titik lokasi terpilih
              </p>
              <p className="mt-1 wrap-break-word text-[11px] text-slate-600">
                {draft.address ||
                  "Alamat belum dikenali; koordinat tetap tersedia."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[10.5px] leading-4 text-slate-500">
          Belum ada titik yang dipilih. Peta dibuka di area Surabaya; ini hanya
          titik awal peta, bukan lokasi organisasi Anda.
        </p>
      )}
      {message && (
        <p
          role="status"
          className="flex items-start gap-2 text-sm leading-5 text-slate-600"
        >
          {message.includes("belum") || message.includes("gagal") ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          )}
          {message}
        </p>
      )}
      <button
        type="button"
        disabled={!draft || resolvingAddress}
        onClick={confirmLocation}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {resolvingAddress && <LoaderCircle className="h-4 w-4 animate-spin" />}
        Gunakan lokasi ini
      </button>
    </section>
  );
}