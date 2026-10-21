"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Clock3,
  CloudLightning,
  ExternalLink,
  Flame,
  HeartPulse,
  LifeBuoy,
  LocateFixed,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PhoneCall,
  Route,
  Search,
  ShieldCheck,
  Tag,
  UsersRound,
} from "lucide-react";
import type {
  SiagaMapItem,
  SiagaMapLocation,
  SiagaMapPlace,
} from "./siaga-map";

const CATEGORY_OPTIONS = [
  {
    value: "AMBULANCE_MEDICAL",
    label: "Ambulans & Medis",
    icon: HeartPulse,
  },
  {
    value: "FIRE_RESCUE",
    label: "Pemadam Kebakaran",
    icon: Flame,
  },
  {
    value: "DISASTER_RELIEF",
    label: "Bantuan Bencana",
    icon: CloudLightning,
  },
  {
    value: "SEARCH_RESCUE",
    label: "Pencarian & Penyelamatan",
    icon: LifeBuoy,
  },
  {
    value: "COMMUNITY_SUPPORT",
    label: "Dukungan Komunitas",
    icon: UsersRound,
  },
  {
    value: "OTHER",
    label: "Layanan Lainnya",
    icon: MoreHorizontal,
  },
] as const;

const COST_LABELS: Record<string, string> = {
  FREE: "Gratis",
  PAID: "Berbayar",
  DONATION: "Donasi",
  VARIES: "Biaya bervariasi",
  UNKNOWN: "Biaya belum diketahui",
};

interface DirectoryItem {
  organizationId: string;
  organizationName: string;
  profileImageUrl: string | null;
  publicPhone: string | null;
  publicWhatsapp: string | null;
  websiteUrl: string | null;
  publicAddress: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
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

interface OpenStreetMapPlace {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  openingHours: string | null;
  source: "GEOAPIFY";
  sourceLabel: string;
  sourceUrl: string | null;
  verifiedByHelpMe: false;
}

type LoadStatus = "loading" | "success" | "error";

const PARTNER_RADIUS_METERS = 15_000;
const SIAGA_PAGE_SIZE = 5;

const SiagaMapView = dynamic(() => import("./siaga-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
      Memuat peta layanan...
    </div>
  ),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error("Format data direktori tidak sesuai.");
  }

  return value;
}

function readNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Format data direktori tidak sesuai.");
  }

  return value;
}

function readNullableNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Format koordinat direktori tidak sesuai.");
  }

  return value;
}

function parseDirectoryResponse(value: unknown): DirectoryItem[] {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error(
      "Respons direktori tidak memiliki daftar penyedia yang valid.",
    );
  }

  return value.items.map((entry): DirectoryItem => {
    if (!isRecord(entry)) {
      throw new Error("Data penyedia tidak valid.");
    }

    return {
      organizationId: readString(entry, "organizationId"),
      organizationName: readString(entry, "organizationName"),
      profileImageUrl: readNullableString(entry, "profileImageUrl"),
      publicPhone: readNullableString(entry, "publicPhone"),
      publicWhatsapp: readNullableString(entry, "publicWhatsapp"),
      websiteUrl: readNullableString(entry, "websiteUrl"),
      publicAddress: readNullableString(entry, "publicAddress"),
      district: readNullableString(entry, "district"),
      latitude: readNullableNumber(entry, "latitude"),
      longitude: readNullableNumber(entry, "longitude"),
      city: readString(entry, "city"),
      province: readString(entry, "province"),
      verifiedSourceLabel: readString(entry, "verifiedSourceLabel"),
      verifiedSourceUrl: readNullableString(entry, "verifiedSourceUrl"),
      serviceId: readString(entry, "serviceId"),
      serviceName: readString(entry, "serviceName"),
      serviceCategory: readString(entry, "serviceCategory"),
      serviceDescription: readString(entry, "serviceDescription"),
      servicePhone: readNullableString(entry, "servicePhone"),
      serviceWhatsapp: readNullableString(entry, "serviceWhatsapp"),
      serviceArea: readString(entry, "serviceArea"),
      costType: readString(entry, "costType"),
      operatingHours: readNullableString(entry, "operatingHours"),
      distanceMeters: readNullableNumber(entry, "distanceMeters"),
    };
  });
}

function parseGeoapifyResponse(value: unknown): OpenStreetMapPlace[] {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error(
      "Respons Geoapify tidak memiliki daftar tempat yang valid.",
    );
  }

  return value.items.map((entry): OpenStreetMapPlace => {
    if (!isRecord(entry)) {
      throw new Error("Data tempat dari Geoapify tidak valid.");
    }

    const latitude = entry.latitude;
    const longitude = entry.longitude;

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Koordinat tempat Geoapify tidak valid.");
    }

    if (entry.source !== "GEOAPIFY" || entry.verifiedByHelpMe !== false) {
      throw new Error("Label sumber tempat Geoapify tidak valid.");
    }

    return {
      id: readString(entry, "id"),
      name: readString(entry, "name"),
      category: readString(entry, "category"),
      latitude,
      longitude,
      address: readNullableString(entry, "address"),
      phone: readNullableString(entry, "phone"),
      websiteUrl: readNullableString(entry, "websiteUrl"),
      openingHours: readNullableString(entry, "openingHours"),
      source: "GEOAPIFY",
      sourceLabel: readString(entry, "sourceLabel"),
      sourceUrl: readNullableString(entry, "sourceUrl"),
      verifiedByHelpMe: false,
    };
  });
}

function safeExternalUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function telephoneHref(value: string): string | null {
  const normalized = value.replace(/[^\d+]/g, "");

  return /^\+?\d{5,20}$/.test(normalized) ? "tel:" + normalized : null;
}

function safeWhatsAppUrl(value: string): string | null {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }

  return /^\d{8,20}$/.test(digits) ? "https://wa.me/" + digits : null;
}

function calculateDistanceMeters(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = radians(toLatitude - fromLatitude);
  const longitudeDifference = radians(toLongitude - fromLongitude);
  const fromLatitudeRadians = radians(fromLatitude);
  const toLatitudeRadians = radians(toLatitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(Math.max(0, haversine))))
  );
}
function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return "Jarak tidak tersedia";
  }

  if (meters < 1000) {
    return Math.round(meters) + " m";
  }

  return (meters / 1000).toFixed(1).replace(".", ",") + " km";
}

function categoryLabel(value: string): string {
  if (value === "AMBULANCE" || value === "MEDICAL") {
    return "Ambulans & Medis";
  }

  if (value === "SECURITY") {
    return "Keamanan";
  }

  return (
    CATEGORY_OPTIONS.find((category) => category.value === value)?.label ??
    "Kategori lainnya"
  );
}

function categoryIcon(value: string) {
  const classes = "h-2.5 w-2.5 shrink-0";

  if (
    value === "AMBULANCE" ||
    value === "MEDICAL" ||
    value === "AMBULANCE_MEDICAL"
  ) {
    return <HeartPulse className={classes} aria-hidden="true" />;
  }

  if (value === "SECURITY") {
    return <ShieldCheck className={classes} aria-hidden="true" />;
  }

  if (value === "FIRE_RESCUE") {
    return <Flame className={classes} aria-hidden="true" />;
  }

  if (value === "DISASTER_RELIEF") {
    return <CloudLightning className={classes} aria-hidden="true" />;
  }

  if (value === "SEARCH_RESCUE") {
    return <LifeBuoy className={classes} aria-hidden="true" />;
  }

  if (value === "COMMUNITY_SUPPORT") {
    return <UsersRound className={classes} aria-hidden="true" />;
  }

  return <MoreHorizontal className={classes} aria-hidden="true" />;
}

function ServiceCategoryBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-1 py-0.5 text-[9px] font-semibold text-blue-800">
      {categoryIcon(value)}
      {categoryLabel(value)}
    </span>
  );
}
export default function SiagaDirectory() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [partnerRequestVersion, setPartnerRequestVersion] = useState(0);
  const [placesRequestVersion, setPlacesRequestVersion] = useState(0);
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [partnerStatus, setPartnerStatus] = useState<LoadStatus>("loading");

  const [places, setPlaces] = useState<OpenStreetMapPlace[]>([]);
  const [placesStatus, setPlacesStatus] = useState<LoadStatus>("loading");
  const [placesErrorMessage, setPlacesErrorMessage] = useState("");
  const [userLocation, setUserLocation] = useState<SiagaMapLocation | null>(
    null,
  );
  const [locationMessage, setLocationMessage] = useState("");
  const automaticLocationRequestedRef = useRef(false);

  useEffect(() => {
    function handleSiagaLocationUpdate(event: Event) {
      if (!(event instanceof CustomEvent) || !isRecord(event.detail)) {
        return;
      }

      const latitude = event.detail.latitude;
      const longitude = event.detail.longitude;

      if (
        typeof latitude !== "number" ||
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        typeof longitude !== "number" ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return;
      }

      setUserLocation({ latitude, longitude });
      setLocationMessage("");
      setPartnerStatus("loading");
      setPlacesStatus("loading");
    }

    window.addEventListener("siaga-location-update", handleSiagaLocationUpdate);

    return () => {
      window.removeEventListener("siaga-location-update", handleSiagaLocationUpdate);
    };
  }, []);
  const [feedPage, setFeedPage] = useState(1);

  // Minta lokasi perangkat sekali ketika direktori Siaga pertama kali dimuat.
  useEffect(() => {
    if (automaticLocationRequestedRef.current) {
      return;
    }

    automaticLocationRequestedRef.current = true;

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.dispatchEvent(
          new CustomEvent("siaga-location-update", {
            detail: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }),
        );
      },
      () => {
        setLocationMessage(
          "Lokasi tidak dapat diakses. Anda tetap dapat mencari layanan di Surabaya.",
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDirectory() {
      const categories: (string | null)[] =
        appliedCategory === "AMBULANCE_MEDICAL"
          ? ["AMBULANCE", "MEDICAL"]
          : appliedCategory === ""
            ? [null]
            : [appliedCategory];

      try {
        const categoryResults = await Promise.all(
          categories.map(async (category) => {
            const params = new URLSearchParams({
              city: "Surabaya",
              limit: "50",
            });

            if (appliedSearch) {
              params.set("search", appliedSearch);
            }

            if (category !== null) {
              params.set("category", category);
            }

            if (userLocation) {
              params.set("latitude", String(userLocation.latitude));
              params.set("longitude", String(userLocation.longitude));
            }

            const response = await fetch(
              "/api/siaga/directory?" + params.toString(),
              {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal,
              },
            );

            const payload: unknown = await response.json();

            if (!response.ok) {
              if (response.status === 503) {
                throw new Error(
                  "Direktori mitra HelpMe sementara tidak tersedia. Lokasi umum dari Geoapify tetap dapat ditampilkan.",
                );
              }

              const message =
                isRecord(payload) && typeof payload.message === "string"
                  ? payload.message
                  : "Direktori mitra HelpMe gagal dimuat.";

              throw new Error(message);
            }

            return parseDirectoryResponse(payload);
          }),
        );

        const uniqueItems = new Map<string, DirectoryItem>();

        for (const categoryItems of categoryResults) {
          for (const item of categoryItems) {
            uniqueItems.set(item.organizationId + "|" + item.serviceId, item);
          }
        }

        if (!controller.signal.aborted) {
          setItems(Array.from(uniqueItems.values()));
          setPartnerStatus("success");
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setItems([]);
        setPartnerStatus("error");
      }
    }

    void loadDirectory();

    return () => {
      controller.abort();
    };
  }, [appliedSearch, appliedCategory, partnerRequestVersion, userLocation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      const params = new URLSearchParams({
        category: appliedCategory || "ALL",
      });

      if (appliedSearch) {
        params.set("search", appliedSearch);
      }

      if (userLocation) {
        params.set("latitude", String(userLocation.latitude));
        params.set("longitude", String(userLocation.longitude));
      }

      try {
        const response = await fetch("/api/siaga/places?" + params.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.message === "string"
              ? payload.message
              : "Pencarian tempat Geoapify sementara tidak tersedia.";

          throw new Error(message);
        }

        const nextPlaces = parseGeoapifyResponse(payload);

        if (!controller.signal.aborted) {
          setPlaces(nextPlaces);
          setPlacesStatus("success");
          setPlacesErrorMessage("");
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setPlaces([]);
        setPlacesStatus("error");
        setPlacesErrorMessage(
          error instanceof TypeError
            ? "Sumber peta tidak dapat dihubungi. Coba lagi nanti."
            : error instanceof Error
              ? error.message
              : "Gagal mengambil tempat dari Geoapify.",
        );
      }
    }

    void loadPlaces();

    return () => {
      controller.abort();
    };
  }, [appliedSearch, appliedCategory, placesRequestVersion, userLocation]);

  const radiusFilteredItems = useMemo(() => {
    if (userLocation === null) {
      return items;
    }

    return items.flatMap((item) => {
      if (
        item.latitude === null ||
        item.longitude === null ||
        item.latitude < -90 ||
        item.latitude > 90 ||
        item.longitude < -180 ||
        item.longitude > 180
      ) {
        return [];
      }

      const distanceMeters = calculateDistanceMeters(
        userLocation.latitude,
        userLocation.longitude,
        item.latitude,
        item.longitude,
      );

      if (distanceMeters > PARTNER_RADIUS_METERS) {
        return [];
      }

      return [{ ...item, distanceMeters: Math.round(distanceMeters) }];
    });
  }, [items, userLocation]);

  const sortedItems = useMemo(() => {
    const result = [...radiusFilteredItems];

    result.sort((left, right) => {
      if (userLocation !== null) {
        if (left.distanceMeters !== null && right.distanceMeters !== null) {
          return (
            left.distanceMeters - right.distanceMeters ||
            left.serviceName.localeCompare(right.serviceName, "id")
          );
        }

        if (left.distanceMeters !== null) return -1;
        if (right.distanceMeters !== null) return 1;
      }

      return left.serviceName.localeCompare(right.serviceName, "id");
    });

    return result;
  }, [radiusFilteredItems, userLocation]);

  const radiusFilteredPlaces = useMemo(() => {
    if (userLocation === null) {
      return places;
    }

    const withinRadius = (radiusMeters: number) =>
      places.filter(
        (place) =>
          calculateDistanceMeters(
            userLocation.latitude,
            userLocation.longitude,
            place.latitude,
            place.longitude,
          ) <= radiusMeters,
      );

    const withinFiveKm = withinRadius(5_000);
    if (withinFiveKm.length >= 10) {
      return withinFiveKm;
    }

    const withinSevenKm = withinRadius(7_000);
    if (withinSevenKm.length >= 10) {
      return withinSevenKm;
    }

    return withinRadius(10_000);
  }, [places, userLocation]);

  const sortedPlaces = useMemo(() => {
    const result = [...radiusFilteredPlaces];

    if (userLocation !== null) {
      result.sort(
        (left, right) =>
          calculateDistanceMeters(
            userLocation.latitude,
            userLocation.longitude,
            left.latitude,
            left.longitude,
          ) -
          calculateDistanceMeters(
            userLocation.latitude,
            userLocation.longitude,
            right.latitude,
            right.longitude,
          ),
      );
    }

    return result;
  }, [radiusFilteredPlaces, userLocation]);

  const feedItems = useMemo(() => {
    const partnerEntries = (partnerStatus === "success" ? sortedItems : []).map(
      (item) => ({
        kind: "PARTNER" as const,
        key: `partner:${item.organizationId}:${item.serviceId}`,
        item,
        distanceMeters: item.distanceMeters,
      }),
    );

    const placeEntries = (placesStatus === "success" ? sortedPlaces : []).map(
      (place) => ({
        kind: "PLACE" as const,
        key: `place:${place.id}`,
        place,
        distanceMeters:
          userLocation === null
            ? null
            : calculateDistanceMeters(
                userLocation.latitude,
                userLocation.longitude,
                place.latitude,
                place.longitude,
              ),
      }),
    );

    const compareDistance = (
      left: { distanceMeters: number | null },
      right: { distanceMeters: number | null },
    ) => {
      if (left.distanceMeters !== null && right.distanceMeters !== null) {
        return left.distanceMeters - right.distanceMeters;
      }

      if (left.distanceMeters !== null) return -1;
      if (right.distanceMeters !== null) return 1;
      return 0;
    };

    partnerEntries.sort(
      (left, right) =>
        compareDistance(left, right) ||
        left.item.serviceName.localeCompare(right.item.serviceName, "id"),
    );

    placeEntries.sort(
      (left, right) =>
        compareDistance(left, right) ||
        left.place.name.localeCompare(right.place.name, "id"),
    );

    return [...partnerEntries, ...placeEntries];
  }, [partnerStatus, sortedItems, placesStatus, sortedPlaces, userLocation]);

  const feedPageCount = Math.max(
    1,
    Math.ceil(feedItems.length / SIAGA_PAGE_SIZE),
  );
  const currentFeedPage = Math.min(feedPage, feedPageCount);
  const visibleFeedItems = feedItems.slice(
    (currentFeedPage - 1) * SIAGA_PAGE_SIZE,
    currentFeedPage * SIAGA_PAGE_SIZE,
  );
  const mapItems = useMemo<SiagaMapItem[]>(
    () =>
      sortedItems.map((item) => ({
        organizationId: item.organizationId,
        organizationName: item.organizationName,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        latitude: item.latitude,
        longitude: item.longitude,
        publicAddress: item.publicAddress,
        district: item.district,
        city: item.city,
        province: item.province,
      })),
    [sortedItems],
  );

  const mapPlaces = useMemo<SiagaMapPlace[]>(
    () =>
      sortedPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        phone: place.phone,
        websiteUrl: place.websiteUrl,
        openingHours: place.openingHours,
        sourceLabel: place.sourceLabel,
        sourceUrl: place.sourceUrl,
        verifiedByHelpMe: false,
      })),
    [sortedPlaces],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerStatus("loading");
    setFeedPage(1);
    setAppliedSearch(searchInput.trim().slice(0, 100));
    setPartnerRequestVersion((current) => current + 1);
    setPlacesRequestVersion((current) => current + 1);
  }

  function selectCategory(category: string) {
    setFeedPage(1);
    setPartnerStatus("loading");
    setAppliedCategory(category);
    setPartnerRequestVersion((current) => current + 1);
    setPlacesRequestVersion((current) => current + 1);
  }

  function retryPlaces() {
    setFeedPage(1);
    setPlacesStatus("loading");
    setPlacesErrorMessage("");
    setPlacesRequestVersion((current) => current + 1);
  }
  function findInArea() {
    setFeedPage(1);

    if (!navigator.geolocation) {
      setLocationMessage(
        "Browser ini tidak mendukung akses lokasi. Anda tetap dapat mencari layanan di Surabaya.",
      );
      return;
    }

    setLocationMessage("Meminta izin lokasi perangkat...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.dispatchEvent(
          new CustomEvent("siaga-location-update", {
            detail: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }),
        );
      },
      () => {
        setLocationMessage(
          "Lokasi tidak dapat diakses. Anda tetap dapat mencari layanan di Surabaya.",
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <section
      id="direktori-penyedia"
      className="mt-4 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_5px_18px_rgba(15,23,42,0.035)] sm:p-5"
      aria-labelledby="siaga-providers-title"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="siaga-providers-title"
            className="text-[13px] font-semibold tracking-tight text-[#142653] sm:text-xl"
          >
            Temukan layanan darurat dan penyedia terdekat.
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="siaga-directory-search" className="sr-only">
          Cari nama penyedia atau layanan
        </label>

        <div className="flex items-center gap-2 rounded-[22px] border border-rose-200 bg-slate-50 px-2 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100">
          <Search
            className="h-3.5 w-3.5 shrink-0 text-rose-500"
            aria-hidden="true"
          />
          <input
            id="siaga-directory-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
            placeholder="Cari nama penyedia atau layanan..."
            className="h-12 min-w-0 flex-1 bg-transparent text-[12px] text-slate-800 outline-none placeholder:text-rose-400"
          />
          <button
            type="submit"
            disabled={partnerStatus === "loading"}
            aria-label="Cari layanan"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="mt-3" role="group" aria-label="Filter kategori layanan">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORY_OPTIONS.map((category) => {
            const CategoryIcon = category.icon;

            return (
              <button
                key={category.value}
                type="button"
                aria-pressed={appliedCategory === category.value}
                onClick={() => selectCategory(category.value)}
                className={
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10.5px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 " +
                  (appliedCategory === category.value
                    ? "border-rose-700 bg-rose-500 text-white"
                    : "border-rose-200 bg-white text-rose-600 hover:border-rose-300")
                }
              >
                <CategoryIcon
                  className={
                    "items-center h-3 w-3 shrink-0 " +
                    (appliedCategory === category.value
                      ? "text-white"
                      : "text-rose-500")
                  }
                  aria-hidden="true"
                />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {locationMessage && (
        <p role="status" className="mt-1 text-xs leading-5 text-slate-500">
          {locationMessage}
        </p>
      )}

      <div className="relative z-0 mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <div className="h-58.75 sm:h-75">
          <SiagaMapView
            items={mapItems}
            places={mapPlaces}
            userLocation={userLocation}
          />
        </div>

        <div className="ml-9 pointer-events-none absolute inset-x-3 top-3 z-1000 flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={findInArea}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <LocateFixed className="-ml-1 h-3 w-3 text-blue-700" aria-hidden="true" />
            Terdekat
          </button>
        </div>
      </div>

      <div
        id="siaga-directory-results"
        className="mt-4 scroll-mt-24 border-t border-slate-100 pt-4"
      >
        {placesStatus === "loading" && (
          <p role="status" className="mb-3 text-xs text-slate-500">
            Mencari tempat di peta...
          </p>
        )}
        {placesStatus === "error" && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
          >
            <p className="text-xs leading-5 text-amber-950">
              {placesErrorMessage}
            </p>
            <button
              type="button"
              onClick={retryPlaces}
              className="mt-2 rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
            >
              Coba muat lagi
            </button>
          </div>
        )}
        {partnerStatus === "loading" && (
          <p role="status" className="mb-3 text-xs text-slate-500">
            Memuat mitra terverifikasi HelpMe...
          </p>
        )}
        {feedItems.length > 0 && (
          <section
            className="mb-5 space-y-3"
            aria-labelledby="siaga-feed-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {feedItems.length} hasil ditemukan
              </span>
            </div>

            <div className="space-y-3">
              {visibleFeedItems.map((entry) => {
                if (entry.kind === "PLACE") {
                  const place = entry.place;

                  const phoneLink = place.phone
                    ? telephoneHref(place.phone)
                    : null;
                  const websiteLink = safeExternalUrl(place.websiteUrl);
                  const sourceLink = safeExternalUrl(place.sourceUrl);
                  const routeLink =
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                    place.latitude +
                    "," +
                    place.longitude;

                  return (
                    <article
                      key={place.id}
                      className="rounded-2xl border border-rose-400 bg-white p-3 transition hover:border-rose-200 sm:p-3.5"
                    >
                      <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 gap-y-2 sm:grid-cols-[44px_minmax(0,1fr)_240px] sm:items-center sm:gap-x-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-800 sm:h-12 sm:w-12">
                          <Building2 className="h-6 w-6" aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-1 py-0.5 text-[9px] font-bold text-blue-800">
                              <MapPin className="h-2 w-2" aria-hidden="true" />
                              Lokasi peta
                            </span>
                            <ServiceCategoryBadge value={place.category} />
                          </div>

                          <h4 className="mt-1 text-[13px] font-semibold leading-4 text-[#142653] sm:text-sm">
                            {place.name}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] leading-4 text-slate-600">
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <MapPin
                                className="h-3 w-3 shrink-0 text-slate-400"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {place.address ||
                                  "Alamat tidak tersedia pada data peta."}
                              </span>
                            </span>

                            {userLocation !== null && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                                <LocateFixed
                                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                  aria-hidden="true"
                                />
                                {formatDistance(
                                  calculateDistanceMeters(
                                    userLocation.latitude,
                                    userLocation.longitude,
                                    place.latitude,
                                    place.longitude,
                                  ),
                                )}{" "}
                                dari kamu
                              </span>
                            )}
                            {place.openingHours && (
                              <span className="inline-flex items-center gap-1">
                                <Clock3
                                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                  aria-hidden="true"
                                />
                                {place.openingHours}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[9px] leading-4 text-amber-700">
                            Data peta · belum diverifikasi HelpMe
                          </p>
                        </div>

                        <div className="col-span-2 flex flex-wrap items-center justify-start gap-1.5 border-t border-slate-100 pt-2 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:justify-end sm:border-0 sm:pt-0">
                          {phoneLink && (
                            <a
                              href={phoneLink}
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-blue-700 px-2.5 text-[11px] font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <PhoneCall
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              Telepon
                            </a>
                          )}

                          <a
                            href={routeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          >
                            <Route className="h-3.5 w-3.5" aria-hidden="true" />
                            Rute
                          </a>

                          {websiteLink && (
                            <a
                              href={websiteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              Situs web
                            </a>
                          )}

                          {sourceLink && (
                            <a
                              href={sourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <ExternalLink
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              Sumber peta
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }

                const item = entry.item;

                const phone =
                  item.servicePhone?.trim() || item.publicPhone?.trim() || null;
                const whatsapp =
                  item.serviceWhatsapp?.trim() ||
                  item.publicWhatsapp?.trim() ||
                  null;
                const phoneLink = phone ? telephoneHref(phone) : null;
                const whatsappLink = whatsapp
                  ? safeWhatsAppUrl(whatsapp)
                  : null;
                const websiteLink = safeExternalUrl(item.websiteUrl);
                const sourceLink = safeExternalUrl(item.verifiedSourceUrl);

                const routeLink =
                  item.latitude !== null && item.longitude !== null
                    ? "https://www.google.com/maps/dir/?api=1&destination=" +
                      item.latitude +
                      "," +
                      item.longitude
                    : null;

                const addressParts = [
                  item.publicAddress,
                  item.district ? "Kec. " + item.district : null,
                  item.city,
                  item.province,
                ].filter(
                  (part): part is string =>
                    typeof part === "string" && part.trim().length > 0,
                );

                return (
                  <article
                    key={item.organizationId + "-" + item.serviceId}
                    className="rounded-2xl border border-rose-400 bg-white p-3 transition hover:border-rose-200 sm:p-3.5"
                  >
                    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-2 sm:grid-cols-[72px_minmax(0,1fr)_250px] sm:gap-x-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 text-blue-800 sm:h-18 sm:w-18">
                        {item.profileImageUrl ? (
                          <Image
                            src={item.profileImageUrl}
                            alt={`Logo organisasi ${item.organizationName}`}
                            width={72}
                            height={72}
                            unoptimized
                            className="h-full w-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6" aria-hidden="true" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {/* status dan kategori */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1 py-0.5 text-[9px] font-bold text-emerald-800">
                            <ShieldCheck
                              className="h-2 w-2"
                              aria-hidden="true"
                            />
                            Terverifikasi
                          </span>

                          <ServiceCategoryBadge value={item.serviceCategory} />
                        </div>

                        {/* layanan */}
                        <h3 className="mt-1 min-w-0 text-[13.5px] font-semibold leading-4 text-[#142653] sm:text-sm">
                          {item.serviceName}
                        </h3>
                        <p className="text-[10px] font-medium leading-4 p-1 text-slate-600">
                          {item.organizationName}
                        </p>
                         <div className="col-span-2 flex flex-col gap-2 border-t border-slate-200 pt-2 sm:col-span-2 sm:col-start-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"></div>

                        <div className="mt-1 hidden flex-wrap items-center gap-x-1 gap-y-1 text-[9px] leading-3 text-slate-600 sm:flex">
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin
                              className="h-3.5 w-3.5 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 wrap-break-word line-clamp-2 sm:line-clamp-1">
                              {addressParts.length > 0
                                ? addressParts.join(", ")
                                : "Alamat publik belum tersedia"}
                            </span>
                          </span>

                          <span className="text-slate-500">
                            Area: {item.serviceArea} |
                          </span>

                          {item.distanceMeters !== null && (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                              <LocateFixed
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden="true"
                              />
                              {formatDistance(item.distanceMeters)} dari kamu |
                            </span>
                          )}

                          {item.operatingHours && (
                            <span className="inline-flex items-center gap-1">
                              <Clock3
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden="true"
                              />
                              {item.operatingHours} |
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1">
                            <Tag
                              className="h-3.5 w-3.5 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            {COST_LABELS[item.costType] ??
                              "Informasi biaya belum tersedia"}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] leading-4 text-slate-600 sm:hidden">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin
                            className="h-2.5 w-2.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 wrap-break-word line-clamp-2 sm:line-clamp-1">
                            {addressParts.length > 0
                              ? addressParts.join(", ")
                              : "Alamat publik belum tersedia"}
                          </span>
                        </span>

                        <span className="text-slate-500">
                          Area: {item.serviceArea} |
                        </span>

                        {item.distanceMeters !== null && (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                            <LocateFixed
                              className="h-2.5 w-2.5 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            {formatDistance(item.distanceMeters)} dari kamu |
                          </span>
                        )}

                        {item.operatingHours && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3
                              className="h-3 w-3 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            {item.operatingHours} |
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1">
                          <Tag
                            className="h-2.5 w-2.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          {COST_LABELS[item.costType] ??
                            "Informasi biaya belum tersedia"}
                        </span>
                      </div>
                      <div className="col-span-2 flex flex-col gap-2 border-t border-slate-200 pt-2 sm:col-span-2 sm:col-start-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:flex-1">
                          <span className="inline-flex items-center gap-1 text-emerald-800">
                            <ShieldCheck
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {item.verifiedSourceLabel}
                          </span>

                          {sourceLink && (
                            <a
                              href={sourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                            >
                              Sumber verifikasi
                              <ExternalLink
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </a>
                          )}

                          {websiteLink && (
                            <a
                              href={websiteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                            >
                              Situs web
                              <ExternalLink
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:w-62.5 sm:shrink-0">
                          {phoneLink ? (
                            <a
                              href={phoneLink}
                              className="inline-flex min-h-9 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-blue-600 px-1 text-[10px] font-bold leading-3 text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <span className="inline-flex items-center gap-1">
                                <PhoneCall
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                Telepon
                              </span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Nomor telepon valid tidak tersedia"
                              className="inline-flex min-h-9 min-w-0 cursor-not-allowed flex-col items-center justify-center gap-0.5 rounded-lg bg-slate-100 px-1 text-[10px] font-bold leading-3 text-slate-400"
                            >
                              <span className="inline-flex items-center gap-1">
                                <PhoneCall
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                Telepon
                              </span>
                              <span className="text-[9px] font-medium">
                                Tidak tersedia
                              </span>
                            </button>
                          )}

                          {whatsappLink ? (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-9 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-emerald-50 px-1 text-[10px] font-bold leading-3 text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                            >
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                WhatsApp
                              </span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Nomor WhatsApp valid tidak tersedia"
                              className="inline-flex min-h-9 min-w-0 cursor-not-allowed flex-col items-center justify-center gap-0.5 rounded-lg bg-slate-100 px-1 text-[10px] font-bold leading-3 text-slate-400"
                            >
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle
                                  className="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                WhatsApp
                              </span>
                              <span className="text-[9px] font-medium">
                                Tidak tersedia
                              </span>
                            </button>
                          )}

                          {routeLink ? (
                            <a
                              href={routeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-9 min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-1 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <Route
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              Rute
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Koordinat publik penyedia tidak tersedia"
                              className="inline-flex min-h-9 min-w-0 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-1 text-[10px] font-bold text-slate-400"
                            >
                              <Route
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              Rute
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {feedItems.length > SIAGA_PAGE_SIZE && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500" aria-live="polite">
                  Menampilkan {(currentFeedPage - 1) * SIAGA_PAGE_SIZE + 1}–
                  {Math.min(
                    currentFeedPage * SIAGA_PAGE_SIZE,
                    feedItems.length,
                  )}{" "}
                  dari {feedItems.length} hasil
                </p>
                <nav
                  aria-label="Navigasi hasil Siaga"
                  className="flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    disabled={currentFeedPage <= 1}
                    onClick={() =>
                      setFeedPage(Math.max(1, currentFeedPage - 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-slate-600">
                    Halaman {currentFeedPage} dari {feedPageCount}
                  </span>
                  <button
                    type="button"
                    disabled={currentFeedPage >= feedPageCount}
                    onClick={() =>
                      setFeedPage(Math.min(feedPageCount, currentFeedPage + 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </nav>
              </div>
            )}
          </section>
        )}
        {placesStatus === "success" &&
          partnerStatus === "success" &&
          feedItems.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <MapPin
                className="mx-auto h-7 w-7 text-slate-400"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-bold text-slate-700">
                Belum ada layanan atau lokasi yang cocok
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Coba kata kunci atau kategori lain. Mitra hanya ditampilkan
                setelah terverifikasi dan layanannya disetujui.
              </p>
            </div>
          )}{" "}
      </div>
    </section>
  );
}