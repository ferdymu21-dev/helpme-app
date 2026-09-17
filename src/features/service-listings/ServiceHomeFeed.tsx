"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CircleCheck,
  Globe2,
  MapPin,
  RefreshCw,
  Star,
  Store,
} from "lucide-react";

import { ServiceMode } from "./constants/service-mode";

import type { ServiceModeValue } from "./constants/service-mode";

import { useHomeServiceFeed } from "./hooks/useHomeServiceFeed";

import { getServiceListingMediaPublicUrl } from "./utils/service-listing-media-url";

interface ServiceHomeFeedProps {
  variant: "MOBILE" | "DESKTOP";
}

const PRICE_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getServiceModeLabel(serviceMode: ServiceModeValue): string {
  switch (serviceMode) {
    case ServiceMode.ONLINE:
      return "Online";

    case ServiceMode.OFFLINE:
      return "Offline";

    case ServiceMode.BOTH:
      return "Online & Offline";
  }
}

function getProviderName(
  fullName: string | null,
  username: string | null,
): string {
  if (fullName && fullName.trim().length > 0) {
    return fullName;
  }

  if (username && username.trim().length > 0) {
    return username;
  }

  return "Provider HelpMe";
}

function isProviderVerified(verificationStatus: string | null): boolean {
  if (!verificationStatus) {
    return false;
  }

  const normalized = verificationStatus.trim().toUpperCase();

  return normalized === "VERIFIED" || normalized === "APPROVED";
}

export default function ServiceHomeFeed({ variant }: ServiceHomeFeedProps) {
  const serviceFeed = useHomeServiceFeed();

  const isDesktop = variant === "DESKTOP";

  return (
  <section
    className={
      isDesktop
        ? "px-8 pt-8 pb-20 xl:px-10"
        : "px-5 pt-7 pb-16"
    }
  >
    <div
      className={
        isDesktop
          ? "mx-auto max-w-360"
          : undefined
      }
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <h2
            className={
              isDesktop
                ? "text-2xl font-black tracking-tight text-slate-950"
                : "text-xl font-black tracking-tight text-slate-950"
            }
          >
            Jasa untukmu
          </h2>

          <p
            className={
              isDesktop
                ? "mt-1.5 max-w-xl text-sm leading-6 text-slate-500"
                : "mt-1 max-w-xs text-xs leading-5 text-slate-500"
            }
          >
            Temukan layanan dari
            provider HelpMe sesuai
            kebutuhanmu.
          </p>
        </div>

        <Link
          href="/services"
          className="
            inline-flex
            min-h-9
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            border-slate-200
            bg-white
            px-3
            text-xs
            font-bold
            text-slate-700
            transition
            hover:border-indigo-200
            hover:text-indigo-700
          "
        >
          Lihat semua

          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        </Link>
      </div>

        {serviceFeed.error ? (
          <div
            className="
              mt-6
              rounded-3xl
              border
              border-rose-200
              bg-rose-50
              px-5
              py-8
              text-center
            "
          >
            <p
              className="
                text-sm
                font-bold
                text-rose-700
              "
            >
              {serviceFeed.error}
            </p>

            <button
              type="button"
              onClick={serviceFeed.refresh}
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-rose-600
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
              "
            >
              <RefreshCw
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />
              Coba lagi
            </button>
          </div>
        ) : serviceFeed.loading ? (
          <div
            className={
              isDesktop
                ? "mt-7 grid grid-cols-2 gap-5 xl:grid-cols-3 2xl:grid-cols-4"
                : "mt-4 space-y-3"
            }
          >
            {Array.from({
              length: isDesktop ? 6 : 3,
            }).map((_, index) => (
              <div
                key={index}
                className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                  "
              >
                <div
                  className="
                      aspect-video
                      animate-pulse
                      bg-slate-200
                    "
                />

                <div
                  className="
                      space-y-3
                      p-4
                    "
                >
                  <div
                    className="
                        h-4
                        w-24
                        animate-pulse
                        rounded
                        bg-slate-200
                      "
                  />

                  <div
                    className="
                        h-5
                        w-4/5
                        animate-pulse
                        rounded
                        bg-slate-200
                      "
                  />

                  <div
                    className="
                        h-4
                        w-1/2
                        animate-pulse
                        rounded
                        bg-slate-100
                      "
                  />
                </div>
              </div>
            ))}
          </div>
        ) : serviceFeed.items.length === 0 ? (
          <div
            className="
              mt-6
              flex
              min-h-44
              flex-col
              items-center
              justify-center
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              text-center
            "
          >
            <Store
              aria-hidden="true"
              className="
                h-10
                w-10
                text-slate-300
              "
            />

            <h3
              className="
                mt-4
                text-base
                font-black
                text-slate-900
              "
            >
              Belum ada jasa tersedia
            </h3>

            <p
              className="
                mt-1
                max-w-sm
                text-xs
                leading-5
                text-slate-500
              "
            >
              Listing jasa aktif akan muncul di sini.
            </p>
          </div>
        ) : (
          <div
            className={
              isDesktop
                ? "mt-7 grid grid-cols-2 gap-5 xl:grid-cols-3 2xl:grid-cols-4"
                : "mt-4 space-y-3"
            }
          >
            {serviceFeed.items.map((listing) => {
              const coverUrl = getServiceListingMediaPublicUrl(
                listing.coverStoragePath,
              );

              const providerName = getProviderName(
                listing.provider.fullName,
                listing.provider.username,
              );

              const verified = isProviderVerified(
                listing.provider.verificationStatus,
              );

              const showsLocation =
                listing.serviceMode !== ServiceMode.ONLINE &&
                listing.locationName;

              return (
                <Link
                  key={listing.id}
                  href={`/services/${listing.id}`}
                  className="
  group
  overflow-hidden
  rounded-3xl
  border
  border-slate-200/90
  bg-white
  transition
  duration-200
  hover:-translate-y-0.5
  hover:border-indigo-200
  hover:shadow-md
"
                >
                  <div
                    className="
                        relative
                        aspect-video
                        overflow-hidden
                        bg-slate-100
                      "
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        unoptimized={process.env.NODE_ENV === "development"}
                        alt={listing.title}
                        fill
                        sizes={
                          isDesktop ? "(max-width: 1280px) 50vw, 25vw" : "100vw"
                        }
                        className="
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-[1.02]
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-xs
                            font-bold
                            text-slate-400
                          "
                      >
                        HelpMe Jasa
                      </div>
                    )}

                    <span
                      className="
  absolute
  top-3
  left-3
  max-w-[75%]
  truncate
  rounded-full
  border
  border-white/70
  bg-white/90
  px-2.5
  py-1.5
  text-[9px]
  font-bold
  text-slate-700
  backdrop-blur
"
                    >
                      {listing.category}
                    </span>
                  </div>

                  <div
  className={
    isDesktop
      ? "p-5"
      : "p-4"
  }
>
  <h3
    className="
      line-clamp-2
      text-base
      font-black
      leading-6
      tracking-tight
      text-slate-950
      transition
      group-hover:text-indigo-700
    "
  >
    {listing.title}
  </h3>

  <div
    className="
      mt-3
      flex
      min-w-0
      items-center
      gap-1.5
    "
  >
    <span
      className="
        truncate
        text-xs
        font-bold
        text-slate-700
      "
    >
      {providerName}
    </span>

    {verified && (
      <CircleCheck
        aria-label="Provider terverifikasi"
        className="
          h-4
          w-4
          shrink-0
          text-indigo-600
        "
      />
    )}
  </div>

  <div
    className="
      mt-3
      flex
      flex-wrap
      items-center
      gap-x-2
      gap-y-1.5
      text-[11px]
      text-slate-500
    "
  >
    <span
      className="
        inline-flex
        items-center
        gap-1
      "
    >
      {listing.serviceMode ===
      ServiceMode.OFFLINE ? (
        <MapPin
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      ) : (
        <Globe2
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      )}

      {getServiceModeLabel(
        listing.serviceMode,
      )}
    </span>

    {showsLocation && (
      <>
        <span
          aria-hidden="true"
          className="text-slate-300"
        >
          •
        </span>

        <span
          className="
            inline-flex
            min-w-0
            items-center
            gap-1
          "
        >
          <MapPin
            aria-hidden="true"
            className="
              h-3.5
              w-3.5
              shrink-0
            "
          />

          <span className="truncate">
            {listing.locationName}
          </span>
        </span>
      </>
    )}

    {listing.provider.rating !==
      null && (
      <>
        <span
          aria-hidden="true"
          className="text-slate-300"
        >
          •
        </span>

        <span
          className="
            inline-flex
            items-center
            gap-1
          "
        >
          <Star
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          {listing.provider.rating.toFixed(
            1,
          )}

          {listing.provider
            .totalReviews !==
            null && (
            <span>
              (
              {
                listing.provider
                  .totalReviews
              }
              )
            </span>
          )}
        </span>
      </>
    )}
  </div>

  <div
    className="
      mt-5
      flex
      items-end
      justify-between
      gap-4
      border-t
      border-slate-100
      pt-4
    "
  >
    <div>
      <p
        className="
          text-[9px]
          font-bold
          tracking-wide
          text-slate-400
          uppercase
        "
      >
        Mulai dari
      </p>

      <p
        className="
          mt-0.5
          text-base
          font-black
          tracking-tight
          text-slate-950
        "
      >
        {PRICE_FORMATTER.format(
          listing.priceFrom,
        )}
      </p>
    </div>

    <span
      className="
        inline-flex
        items-center
        gap-1
        text-[11px]
        font-bold
        text-indigo-600
      "
    >
      Lihat detail

      <ArrowRight
        aria-hidden="true"
        className="
          h-3.5
          w-3.5
          transition
          group-hover:translate-x-0.5
        "
      />
    </span>
  </div>
</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}