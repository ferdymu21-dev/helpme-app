"use client";
import { Suspense, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Globe2,
  MapPin,
  Palette,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";

import {
  SERVICE_CATEGORIES,
} from "./constants/service-categories";

import { ServiceMode } from "./constants/service-mode";

import type { ServiceModeValue } from "./constants/service-mode";

import { useServiceDiscovery } from "./hooks/useServiceDiscovery";

import { getServiceListingMediaPublicUrl } from "./utils/service-listing-media-url";

interface ModeOption {
  label: string;

  value: ServiceModeValue | null;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    label: "Semua",
    value: null,
  },
  {
    label: "Online",
    value: ServiceMode.ONLINE,
  },
  {
    label: "Offline",
    value: ServiceMode.OFFLINE,
  },
  {
    label: "Online & Offline",
    value: ServiceMode.BOTH,
  },
];


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

function ServiceDiscoveryPageContent() {
  const discovery = useServiceDiscovery();

  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <main
      className="
    min-h-screen
    bg-slate-50
    pb-24
    lg:pb-14
  "
    >
      <section
        className="
    border-b
    border-slate-200/80
    bg-white
  "
      >
        <div
          className="
      mx-auto
      max-w-7xl
      px-4
      pt-5
      pb-6
      sm:px-6
      sm:pt-7
      sm:pb-8
      lg:px-8
    "
        >
          {/* PAGE HEADER */}
          <div
            className="
        flex
        items-start
        justify-between
        gap-4
      "
          >
            <div
              className="
          flex
          min-w-0
          items-start
          gap-3
        "
            >
              <Link
                href="/home?feed=jasa"
                aria-label="Kembali ke Home"
                title="Kembali"
                className="
            mt-0.5
            inline-flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            transition
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
            active:scale-95
          "
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </Link>

              <div className="min-w-0">
                <h1
                  className="
              text-base
              font-black
              tracking-tight
              text-slate-950
              sm:text-3xl
            "
                >
                  Cari Jasa
                </h1>

                <p
                  className="
              max-w-xl
              text-[11px]
              leading-5
              text-slate-500
              sm:text-sm
              sm:leading-6
            "
                >
                  Temukan layanan yang sesuai dengan kebutuhanmu.
                </p>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="
          hidden
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-indigo-50
          text-indigo-600
          sm:flex
        "
            >
              <Search className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>

          {/* SEARCH */}
          <div
            className="
        mt-5
        max-w-3xl
      "
          >
            <div className="relative">
              <label className="block">
                <span className="sr-only">Cari jasa</span>

                <Search
                  aria-hidden="true"
                  className="
              pointer-events-none
              absolute
              top-1/2
              left-4
              h-4.5
              w-4.5
              -translate-y-1/2
              text-slate-400
            "
                />

                <input
                  type="search"
                  value={discovery.searchInput}
                  onChange={(event) =>
                    discovery.onSearchChange(event.target.value)
                  }
                  placeholder="Cari jasa atau lokasi..."
                  className="
              h-12
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              pr-14
              pl-11
              text-sm
              text-slate-900
              shadow-sm
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-indigo-400
              focus:ring-4
              focus:ring-indigo-50
            "
                />
              </label>

              <button
                type="button"
                aria-label={
                  filtersOpen ? "Sembunyikan filter" : "Tampilkan filter"
                }
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((current) => !current)}
                className="
            absolute
            top-1/2
            right-2
            inline-flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            text-indigo-600
            transition
            hover:bg-indigo-50
            active:scale-95
          "
              >
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            {filtersOpen && (
              <>
                {/* MODE FILTER */}
                <div
                  id="service-mode-filters"
                  className="
              mt-3
              flex
              gap-2
              overflow-x-auto
              pb-1
              scrollbar-none
              [&::-webkit-scrollbar]:hidden
            "
                >
                  {MODE_OPTIONS.map((option) => {
                    const selected = discovery.serviceMode === option.value;

                    return (
                      <button
                        key={option.value ?? "ALL"}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          discovery.onServiceModeChange(option.value)
                        }
                        className={`
                      shrink-0
                      rounded-xl
                      border
                      px-4
                      py-2
                      text-[11px]
                      font-bold
                      transition
                      ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }
                    `}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {/* CATEGORY FILTER */}
                <div className="mt-3">
                  <p
                    className="
                      mb-2
                      text-[10px]
                      font-bold
                      tracking-wide
                      text-slate-400
                      uppercase
                    "
                  >
                    Kategori
                  </p>

                  <div
                    className="
                      flex
                      gap-2
                      overflow-x-auto
                      pb-1
                      scrollbar-none
                      sm:flex-wrap
                      sm:overflow-visible
                      [&::-webkit-scrollbar]:hidden
                    "
                  >
                    <button
                      type="button"
                      aria-pressed={
                        discovery.category ===
                        null
                      }
                      onClick={() =>
                        discovery.onCategoryChange(
                          null,
                        )
                      }
                      className={`
                        shrink-0
                        rounded-xl
                        border
                        px-3
                        py-2
                        text-[10px]
                        font-bold
                        transition
                        ${
                          discovery.category ===
                          null
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                        }
                      `}
                    >
                      Semua kategori
                    </button>

                    {SERVICE_CATEGORIES.map(
                      (
                        categoryDefinition,
                      ) => {
                        const selected =
                          discovery.category ===
                          categoryDefinition.value;

                        return (
                          <button
                            key={
                              categoryDefinition.value
                            }
                            type="button"
                            aria-pressed={
                              selected
                            }
                            onClick={() =>
                              discovery.onCategoryChange(
                                categoryDefinition.value,
                              )
                            }
                            className={`
                              shrink-0
                              rounded-xl
                              border
                              px-3
                              py-2
                              text-[10px]
                              font-bold
                              transition
                              ${
                                selected
                                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                              }
                            `}
                          >
                            {
                              categoryDefinition.label
                            }
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        className="
    mx-auto
    max-w-7xl
    px-4
    py-5
    sm:px-6
    sm:py-6
    lg:px-8
  "
      >
        <div
          className="
    mb-4
    flex
    items-end
    justify-between
    gap-4
  "
        >
          <div>
            <h2
              className="
        text-lg
        font-black
        tracking-tight
        text-slate-950
      "
            >
              Jasa tersedia
            </h2>

            <p
              className="
        mt-0.5
        text-xs
        text-slate-500
      "
            >
              {discovery.totalCount === null
                ? "Menampilkan jasa yang tersedia"
                : `${discovery.totalCount} jasa ditemukan`}
            </p>
          </div>

          {!discovery.loading && (
            <button
              type="button"
              onClick={discovery.refresh}
              aria-label="Muat ulang daftar jasa"
              title="Muat ulang"
              className="
        inline-flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        text-slate-500
        shadow-sm
        transition
        hover:border-slate-300
        hover:bg-slate-50
        hover:text-indigo-600
        active:scale-95
      "
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        {discovery.error ? (
          <div
            className="
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
              {discovery.error}
            </p>

            <button
              type="button"
              onClick={discovery.refresh}
              className="
                mt-4
                rounded-xl
                bg-rose-600
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
              "
            >
              Coba lagi
            </button>
          </div>
        ) : discovery.loading ? (
          <div
            className="
    grid
    gap-4
    sm:grid-cols-2
    lg:gap-5
    xl:grid-cols-3
  "
          >
            {Array.from({
              length: 6,
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
                      aspect-16/10
                      animate-pulse
                      bg-slate-200
                    "
                />

                <div
                  className="
                      space-y-3
                      p-5
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
                        h-6
                        w-4/5
                        animate-pulse
                        rounded
                        bg-slate-200
                      "
                  />

                  <div
                    className="
                        h-4
                        w-full
                        animate-pulse
                        rounded
                        bg-slate-100
                      "
                  />

                  <div
                    className="
                        h-4
                        w-2/3
                        animate-pulse
                        rounded
                        bg-slate-100
                      "
                  />
                </div>
              </div>
            ))}
          </div>
        ) : discovery.items.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <Users
              aria-hidden="true"
              className="
                mx-auto
                h-10
                w-10
                text-slate-300
              "
            />

            <h3
              className="
                mt-4
                text-lg
                font-black
                text-slate-900
              "
            >
              {discovery.hasActiveFilters
                ? "Tidak ada jasa yang cocok"
                : "Belum ada jasa tersedia"}
            </h3>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
              "
            >
              {discovery.hasActiveFilters
                ? "Coba ubah kata pencarian, kategori, atau mode layanan."
                : "Belum ada listing jasa aktif yang dapat ditampilkan saat ini."}
            </p>

            {discovery.hasActiveFilters && (
              <button
                type="button"
                onClick={discovery.clearFilters}
                className="
  mt-5
  inline-flex
  min-h-9
  items-center
  justify-center
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-xs
  font-bold
  text-slate-700
  transition
  hover:border-slate-300
  hover:bg-slate-50
  hover:text-slate-900
"
              >
                Hapus filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {discovery.items.map((listing) => {
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
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-sm
    transition
    duration-200
    hover:-translate-y-0.5
    hover:border-indigo-200
    hover:shadow-md
  "
                  >
                    {/* COVER */}
                    <div
                      className="
      relative
      aspect-16/10
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
                          sizes="
          (max-width: 640px) 100vw,
          (max-width: 1280px) 50vw,
          33vw
        "
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
          text-sm
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
        inline-flex
        max-w-[75%]
        items-center
        gap-1.5
        truncate
        rounded-lg
        border
        border-white/70
        bg-white/90
        px-2.5
        py-1.5
        text-[10px]
        font-bold
        text-indigo-700
        backdrop-blur-sm
      "
                      >
                        <Palette
                          aria-hidden="true"
                          className="
          h-3
          w-3
          shrink-0
        "
                        />

                        <span className="truncate">{listing.category}</span>
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4 sm:p-5">
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
        sm:text-[17px]
      "
                      >
                        {listing.title}
                      </h3>

                      {/* PROVIDER + META */}
                      <div
                        className="
        mt-2
        flex
        flex-wrap
        items-center
        gap-x-2
        gap-y-1.5
        text-[11px]
      "
                      >
                        <span
                          className="
          inline-flex
          min-w-0
          items-center
          gap-1.5
        "
                        >
                          <span
                            className="
            inline-flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-slate-900
            text-[9px]
            font-black
            text-white
          "
                          >
                            {providerName.charAt(0).toUpperCase()}
                          </span>

                          <span
                            className="
            max-w-30
            truncate
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
                        </span>

                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>

                        <span
                          className="
          inline-flex
          items-center
          gap-1
          text-slate-500
        "
                        >
                          {listing.serviceMode === ServiceMode.ONLINE ? (
                            <span
                              aria-hidden="true"
                              className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-500
            "
                            />
                          ) : listing.serviceMode === ServiceMode.OFFLINE ? (
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

                          {getServiceModeLabel(listing.serviceMode)}
                        </span>

                        {listing.provider.rating !== null && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>

                            <span
                              className="
              inline-flex
              items-center
              gap-1
              text-slate-500
            "
                            >
                              <Star
                                aria-hidden="true"
                                className="
                h-3.5
                w-3.5
                fill-amber-400
                text-amber-400
              "
                              />

                              {listing.provider.rating.toFixed(1)}

                              {listing.provider.totalReviews !== null && (
                                <span
                                  className="
                  text-slate-400
                "
                                >
                                  ({listing.provider.totalReviews})
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* DESCRIPTION */}
                      <p
                        className="
        mt-3
        line-clamp-2
        text-xs
        leading-5
        text-slate-500
        sm:text-sm
      "
                      >
                        {listing.description}
                      </p>

                      {/* LOCATION */}
                      {showsLocation && (
                        <div
                          className="
          mt-2
          flex
          min-w-0
          items-center
          gap-1.5
          text-[11px]
          text-slate-500
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
                        </div>
                      )}

                      {/* PRICE + CTA */}
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
                        <div className="min-w-0">
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

                          <div
                            className="
            mt-0.5
            flex
            flex-wrap
            items-center
            gap-2
          "
                          >
                            <p
                              className="
              text-base
              font-black
              tracking-tight
              text-indigo-700
            "
                            >
                              {PRICE_FORMATTER.format(listing.priceFrom)}
                            </p>

                            {listing.isNegotiable && (
                              <span
                                className="
                inline-flex
                items-center
                rounded-lg
                bg-emerald-50
                px-2
                py-1
                text-[9px]
                font-bold
                text-emerald-700
              "
                              >
                                Bisa nego
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className="
          inline-flex
          min-h-9
          shrink-0
          items-center
          justify-center
          gap-1
          rounded-xl
          bg-indigo-600
          px-3.5
          text-[11px]
          font-bold
          text-white
          transition
          group-hover:bg-indigo-700
        "
                        >
                          Lihat detail
                          <ChevronRight
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

            {discovery.totalPages > 1 && (
              <nav
                aria-label="Pagination jasa"
                className="
      mt-8
      flex
      items-center
      justify-center
      gap-3
    "
              >
                <button
                  type="button"
                  disabled={!discovery.canGoPrevious || discovery.loading}
                  onClick={discovery.onPreviousPage}
                  aria-label="Halaman sebelumnya"
                  className="
        inline-flex
        h-9
        items-center
        justify-center
        gap-1
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        text-xs
        font-bold
        text-slate-600
        transition
        hover:border-slate-300
        hover:text-slate-900
        disabled:cursor-not-allowed
        disabled:opacity-35
      "
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />

                  <span
                    className="
          hidden
          sm:inline
        "
                  >
                    Sebelumnya
                  </span>
                </button>

                <p
                  className="
        min-w-24
        text-center
        text-xs
        font-bold
        text-slate-500
      "
                >
                  {discovery.currentPage}
                  {" / "}
                  {discovery.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!discovery.canGoNext || discovery.loading}
                  onClick={discovery.onNextPage}
                  aria-label="Halaman berikutnya"
                  className="
        inline-flex
        h-9
        items-center
        justify-center
        gap-1
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        text-xs
        font-bold
        text-slate-600
        transition
        hover:border-slate-300
        hover:text-slate-900
        disabled:cursor-not-allowed
        disabled:opacity-35
      "
                >
                  <span
                    className="hidden sm:inline">
                    Berikutnya
                  </span>

                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function ServiceDiscoveryPageUI() {
  return (
    <Suspense
      fallback={
        <main
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-slate-50
            px-6
            text-center
            text-sm
            text-slate-500
          "
        >
          Menyiapkan pencarian jasa...
        </main>
      }
    >
      <ServiceDiscoveryPageContent />
    </Suspense>
  );
}