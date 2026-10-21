"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import SiagaProviderAvatar from "@/features/siaga/components/siaga-provider-avatar";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function SiagaHeader() {
  const [showHeader, setShowHeader] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Aktifkan lokasi");
  const [locationReady, setLocationReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;

      if (currentScrollY <= 16) {
        setShowHeader(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY > previousScrollY + 8) {
        setShowHeader(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY < previousScrollY - 8) {
        setShowHeader(true);
        lastScrollYRef.current = currentScrollY;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    async function updateLocationLabel(latitude: number, longitude: number) {
      setIsLocating(true);
      setLocationLabel("Mencari lokasi...");

      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
        });

        const response = await fetch(
          "/api/siaga/location?" + params.toString(),
          { cache: "no-store" },
        );

        const payload: unknown = await response.json();

        if (
          response.ok &&
          isRecord(payload) &&
          typeof payload.label === "string" &&
          payload.label.trim().length > 0
        ) {
          setLocationLabel(payload.label);
        } else {
          setLocationLabel("Lokasi aktif");
        }
      } catch {
        setLocationLabel("Lokasi aktif");
      } finally {
        setIsLocating(false);
      }
    }

    function handleLocationUpdate(event: Event) {
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

      setLocationReady(true);
      void updateLocationLabel(latitude, longitude);
    }

    window.addEventListener("siaga-location-update", handleLocationUpdate);

    return () => {
      window.removeEventListener("siaga-location-update", handleLocationUpdate);
    };
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationLabel("Lokasi tidak didukung");
      setLocationReady(false);
      return;
    }

    setIsLocating(true);
    setLocationLabel("Meminta lokasi...");

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
      (error) => {
        setIsLocating(false);
        setLocationReady(false);
        setLocationLabel(error.code === 1 ? "Izinkan lokasi" : "Coba lokasi lagi");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <header
      className={
        "fixed inset-x-0 top-3 z-50 px-3 transition-transform duration-300 ease-out sm:top-4 sm:px-4 " +
        (showHeader
          ? "translate-y-0"
          : "-translate-y-[calc(100%+1.5rem)] pointer-events-none")
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-3xl border border-slate-200/80 bg-white/95 px-2.5 py-2 shadow-[0_8px_28px_rgba(15,23,42,0.08)] backdrop-blur sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Kembali ke beranda HelpMe"
            title="Kembali ke HelpMe"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/"
            aria-label="HelpMe Siaga"
            className="flex min-w-0 items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Image
              src="/logo_siaga.svg"
              alt="HelpMe"
              width={126}
              height={40}
              priority
              className="h-10 w-auto max-w-19 object-contain min-[380px]:max-w-22 sm:h-9 sm:max-w-31.5"
            />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            aria-label="Gunakan lokasi perangkat"
            title="Gunakan lokasi perangkat saat ini"
            className={
              "inline-flex min-h-9 max-w-26 items-center gap-1.5 rounded-full px-2.5 py-2 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 max-[359px]:max-w-20.5 sm:max-w-none sm:gap-2 sm:px-4 sm:text-sm " +
              (locationReady
                ? "bg-rose-50 text-rose-800 hover:bg-rose-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200")
            }
          >
            <MapPin
              className={
                "h-4 w-4 shrink-0 " +
                (locationReady ? "text-rose-600" : "text-slate-500")
              }
              aria-hidden="true"
            />
            <span
              className="max-w-15 truncate max-[359px]:max-w-10.5 sm:max-w-45"
              aria-live="polite"
            >
              {isLocating ? "Mencari..." : locationLabel}
            </span>
          </button>

          <SiagaProviderAvatar />
        </div>
      </div>
    </header>
  );
}