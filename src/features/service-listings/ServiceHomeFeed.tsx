"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CircleCheck,
  Globe2,
  GraduationCap,
  HandHeart,
  Home,
  LayoutGrid,
  MapPin,
  MoreHorizontal,
  Palette,
  RefreshCw,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Wrench,
} from "lucide-react";

import {
  getServiceCategoryDefinition,
  HOME_SERVICE_CATEGORY_VALUES,
  SERVICE_CATEGORY_VALUES,
} from "./constants/service-categories";

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

const HOME_CATEGORY_ICON_BY_VALUE = {
  [SERVICE_CATEGORY_VALUES.HOME_CLEANING]:
    Home,

  [SERVICE_CATEGORY_VALUES.REPAIR_INSTALLATION]:
    Wrench,

  [SERVICE_CATEGORY_VALUES.SHOPPING_QUEUE]:
    ShoppingBag,

  [SERVICE_CATEGORY_VALUES.DELIVERY_MOVING]:
    Truck,

  [SERVICE_CATEGORY_VALUES.DAILY_ASSISTANCE]:
    HandHeart,

  [SERVICE_CATEGORY_VALUES.TUTOR_EDUCATION]:
    GraduationCap,

  [SERVICE_CATEGORY_VALUES.DIGITAL_CREATIVE]:
    Palette,

  [SERVICE_CATEGORY_VALUES.OTHER]:
    MoreHorizontal,
} as const;

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
                ? "text-xl font-black tracking-tight text-slate-950"
                : "text-base font-black tracking-tight text-slate-950"
            }
          >
            Jasa untukmu
          </h2>

          <p
            className={
              isDesktop
                ? "mt-1.5 max-w-xl text-sm leading-6 text-slate-500"
                : "mt-1 max-w-xs text-[10px] leading-4 text-slate-500"
            }
          >
            Temukan layanan yang sesuai dengan kebutuhanmu.
          </p>
        </div>

        <Link
          href="/services"
          className="
            inline-flex
            min-h-7.5
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            border-slate-200
            bg-linear-to-r
            from-indigo-600
            via-violet-600
            to-fuchsia-600
            px-3
            text-[10px]
            font-semibold
            text-white
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

      <div
        className={
          isDesktop
            ? "mt-5 flex flex-wrap gap-2"
            : `
                mt-4
                -mx-5
                flex
                gap-2
                overflow-x-auto
                px-5
                pb-1
                [&::-webkit-scrollbar]:hidden
              `
        }
      >
        <button
          type="button"
          aria-pressed={
            serviceFeed.category === null
          }
          onClick={() =>
            serviceFeed.onCategoryChange(
              null,
            )
          }
          className={
            serviceFeed.category === null
              ? `
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-indigo-600
                  bg-indigo-600
                  px-3.5
                  py-2
                  text-[11px]
                  font-bold
                  text-white
                  shadow-sm
                  transition
                `
              : `
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  py-2
                  text-[11px]
                  font-bold
                  text-slate-600
                  transition
                  hover:border-indigo-200
                  hover:text-indigo-700
                `
          }
        >
          <LayoutGrid
            aria-hidden="true"
            className="
              h-3.5
              w-3.5
            "
          />

          Semua
        </button>

        {HOME_SERVICE_CATEGORY_VALUES.map(
          (categoryValue) => {
            const definition =
              getServiceCategoryDefinition(
                categoryValue,
              );

            if (!definition) {
              return null;
            }

            const selected =
              serviceFeed.category ===
              definition.value;

            const Icon =
              HOME_CATEGORY_ICON_BY_VALUE[
                categoryValue
              ];

            return (
              <button
                key={definition.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  serviceFeed.onCategoryChange(
                    definition.value,
                  )
                }
                className={
                  selected
                    ? `
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-indigo-600
                        bg-indigo-600
                        px-3.5
                        py-2
                        text-[11px]
                        font-bold
                        text-white
                        shadow-sm
                        transition
                      `
                    : `
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-2
                        text-[11px]
                        font-bold
                        text-slate-600
                        transition
                        hover:border-indigo-200
                        hover:text-indigo-700
                      `
                }
              >
                <Icon
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                {definition.homeLabel}
              </button>
            );
          },
        )}
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
                ? "mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2"
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
                    flex
                    min-w-0
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-indigo-200
                    hover:shadow-[0_16px_36px_rgba(79,70,229,0.12)]
                  "
                >
                  <div
                    className={
                      isDesktop
                        ? `
                            relative
                            m-3
                            mr-0
                            w-44
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            bg-slate-100
                          `
                        : `
                            relative
                            m-3
                            mr-0
                            w-28
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            bg-slate-100
                          `
                    }
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        unoptimized={
                          process.env.NODE_ENV ===
                          "development"
                        }
                        alt={listing.title}
                        fill
                        sizes={
                          isDesktop
                            ? "176px"
                            : "112px"
                        }
                        className="
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-[1.03]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          min-h-44
                          items-center
                          justify-center
                          px-3
                          text-center
                          text-[10px]
                          font-bold
                          text-slate-400
                        "
                      >
                        HelpMe Jasa
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      isDesktop
                        ? `
                            flex
                            min-w-0
                            flex-1
                            flex-col
                            p-5
                          `
                        : `
                            flex
                            min-w-0
                            flex-1
                            flex-col
                            p-3.5
                          `
                    }
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <h3
                        className={
                          isDesktop
                            ? `
                                line-clamp-2
                                min-w-0
                                flex-1
                                text-lg
                                font-black
                                leading-6
                                tracking-tight
                                text-slate-950
                                transition
                                group-hover:text-indigo-700
                              `
                            : `
                                line-clamp-2
                                min-w-0
                                flex-1
                                text-[12px]
                                font-black
                                leading-4.5
                                tracking-tight
                                text-slate-950
                              `
                        }
                      >
                        {listing.title}
                      </h3>

                      {listing.provider.rating !==
                        null && (
                        <span
                          className="
                            inline-flex
                            shrink-0
                            items-center
                            gap-1
                            whitespace-nowrap
                            text-[11px]
                            font-bold
                            text-slate-600
                          "
                        >
                          <Star
                            aria-hidden="true"
                            className="
                              h-4
                              w-4
                              fill-amber-400
                              text-amber-400
                            "
                          />

                          {listing.provider.rating.toFixed(
                            1,
                          )}

                          {listing.provider
                            .totalReviews !==
                            null && (
                            <span className="font-medium text-slate-400">
                              (
                              {
                                listing.provider
                                  .totalReviews
                              }
                              )
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <div
                      className="
                        mt-2.5
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      {listing.provider
                        .avatarUrl ? (
                        <div
                          role="img"
                          aria-label={`Foto ${providerName}`}
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              listing.provider
                                .avatarUrl,
                            )})`,
                          }}
                          className="
                            h-8
                            w-8
                            shrink-0
                            rounded-full
                            bg-slate-100
                            bg-cover
                            bg-center
                            ring-1
                            ring-slate-200
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-100
                            text-[11px]
                            font-black
                            text-indigo-700
                          "
                        >
                          {providerName
                            .charAt(0)
                            .toUpperCase() ||
                            "H"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-1
                          "
                        >
                          <span
                            className="
                              truncate
                              text-[11px]
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
                                h-3.5
                                w-3.5
                                shrink-0
                                text-indigo-600
                              "
                            />
                          )}
                        </div>

                        <div
                          className="
                            mt-0.5
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            text-[9px]
                            font-medium
                            text-slate-400
                          "
                        >
                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1
                            "
                          >
                            {listing.serviceMode ===
                            ServiceMode.OFFLINE ? (
                              <MapPin
                                aria-hidden="true"
                                className="h-3 w-3"
                              />
                            ) : (
                              <Globe2
                                aria-hidden="true"
                                className="h-3 w-3"
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
                                ·
                              </span>

                              <span className="min-w-0 truncate">
                                {listing.locationName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <p
                      className={
                        isDesktop
                          ? `
                              mt-3
                              line-clamp-2
                              text-xs
                              leading-5
                              text-slate-500
                            `
                          : `
                              mt-2.5
                              line-clamp-2
                              text-[10px]
                              leading-3.75
                              text-slate-500
                            `
                      }
                    >
                      {listing.description}
                    </p>

                    <div
                      className="
                        mt-auto
                        flex
                        items-end
                        justify-between
                        gap-3
                        pt-3
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            text-[9px]
                            font-semibold
                            text-slate-400
                          "
                        >
                          Mulai dari
                        </p>

                        <p
                          className={
                            isDesktop
                              ? `
                                  mt-0.5
                                  truncate
                                  text-xl
                                  font-black
                                  tracking-tight
                                  text-orange-600
                                `
                              : `
                                  mt-0.5
                                  truncate
                                  text-sm
                                  font-black
                                  tracking-tight
                                  text-orange-600
                                `
                          }
                        >
                          {PRICE_FORMATTER.format(
                            listing.priceFrom,
                          )}
                        </p>
                      </div>

                      <span
                        className={
                          isDesktop
                            ? `
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-2xl
                                bg-linear-to-r
                                from-indigo-600
                                via-violet-600
                                to-fuchsia-600
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                                shadow-[0_8px_20px_rgba(99,102,241,0.25)]
                              `
                            : `
                                inline-flex
                                shrink-0
                                items-center
                                gap-1
                                rounded-xl
                                bg-linear-to-r
                                from-indigo-600
                                via-violet-600
                                to-fuchsia-600
                                px-2.5
                                py-2
                                text-[9px]
                                font-bold
                                text-white
                                shadow-sm
                              `
                        }
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