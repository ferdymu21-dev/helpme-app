"use client";
import { Suspense } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Globe2,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Users,
} from "lucide-react";

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

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        pb-12
      "
    >
      <section
        className="
          border-b
          border-slate-200
          bg-white
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-8
            sm:px-6
            lg:px-8
            lg:py-10
          "
        >
          <div
            className="
              max-w-3xl
            "
          >
            <p
              className="
                text-xs
                font-black
                tracking-[0.16em]
                text-indigo-600
                uppercase
              "
            >
              HelpMe Jasa
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-4xl
              "
            >
              Cari Jasa
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-600
                sm:text-base
              "
            >
              Temukan layanan dari Provider HelpMe sesuai kebutuhan Anda.
            </p>
          </div>

          <div
            className="
              mt-7
              flex
              flex-col
              gap-4
            "
          >
            <label
              className="
                relative
                block
              "
            >
              <span
                className="
                  sr-only
                "
              >
                Cari jasa
              </span>

              <Search
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  top-1/2
                  left-4
                  h-5
                  w-5
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
                placeholder="Cari nama jasa, kategori, atau lokasi..."
                className="
                  h-13
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  pr-4
                  pl-12
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />
            </label>

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
              "
            >
              {MODE_OPTIONS.map((option) => {
                const selected = discovery.serviceMode === option.value;

                return (
                  <button
                    key={option.value ?? "ALL"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => discovery.onServiceModeChange(option.value)}
                    className={`
                        shrink-0
                        rounded-full
                        border
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        transition
                        ${
                          selected
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                        }
                      `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-7
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mb-5
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
                text-slate-950
              "
            >
              Jasa terbaru
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {discovery.totalCount === null
                ? "Menampilkan hasil jasa yang tersedia."
                : `${discovery.totalCount} jasa tersedia`}
            </p>
          </div>

          {!discovery.loading && (
            <button
              type="button"
              onClick={discovery.refresh}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                font-bold
                text-slate-600
                transition
                hover:border-indigo-200
                hover:text-indigo-700
              "
            >
              <RefreshCw
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />
              Refresh
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
                ? "Coba gunakan kata pencarian lain atau pilih mode layanan yang berbeda."
                : "Belum ada listing jasa aktif yang dapat ditampilkan saat ini."}
            </p>

            {discovery.hasActiveFilters && (
              <button
                type="button"
                onClick={discovery.clearFilters}
                className="
                  mt-5
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:border-indigo-200
                  hover:text-indigo-700
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
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        transition
                        hover:-translate-y-0.5
                        hover:border-indigo-200
                        hover:shadow-lg
                      "
                  >
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

                      <div
                        className="
                            absolute
                            top-3
                            left-3
                            rounded-full
                            bg-white/95
                            px-3
                            py-1.5
                            text-xs
                            font-black
                            text-slate-700
                            shadow-sm
                            backdrop-blur
                          "
                      >
                        {listing.category}
                      </div>
                    </div>

                    <div
                      className="
                          p-5
                        "
                    >
                      <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-bold
                            text-indigo-600
                          "
                      >
                        {listing.serviceMode === ServiceMode.OFFLINE ? (
                          <MapPin
                            aria-hidden="true"
                            className="
                                h-4
                                w-4
                              "
                          />
                        ) : (
                          <Globe2
                            aria-hidden="true"
                            className="
                                h-4
                                w-4
                              "
                          />
                        )}

                        <span>{getServiceModeLabel(listing.serviceMode)}</span>
                      </div>

                      <h3
                        className="
                            mt-3
                            line-clamp-2
                            text-lg
                            font-black
                            leading-6
                            text-slate-950
                            transition
                            group-hover:text-indigo-700
                          "
                      >
                        {listing.title}
                      </h3>

                      <p
                        className="
                            mt-2
                            line-clamp-2
                            text-sm
                            leading-5
                            text-slate-500
                          "
                      >
                        {listing.description}
                      </p>

                      {showsLocation && (
                        <div
                          className="
                              mt-3
                              flex
                              items-center
                              gap-1.5
                              text-xs
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

                          <span
                            className="
                                truncate
                              "
                          >
                            {listing.locationName}
                          </span>
                        </div>
                      )}

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
                        <div
                          className="
                              min-w-0
                            "
                        >
                          <div
                            className="
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
                                  text-slate-600
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

                          {listing.provider.rating !== null && (
                            <div
                              className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-1
                                  text-xs
                                  text-slate-500
                                "
                            >
                              <Star
                                aria-hidden="true"
                                className="
                                    h-3.5
                                    w-3.5
                                  "
                              />

                              <span>{listing.provider.rating.toFixed(1)}</span>

                              {listing.provider.totalReviews !== null && (
                                <span>({listing.provider.totalReviews})</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          className="
                              shrink-0
                              text-right
                            "
                        >
                          <p
                            className="
                                text-[10px]
                                font-bold
                                tracking-wide
                                text-slate-400
                                uppercase
                              "
                          >
                            Mulai
                          </p>

                          <p
                            className="
                                mt-0.5
                                text-sm
                                font-black
                                text-indigo-700
                              "
                          >
                            {PRICE_FORMATTER.format(listing.priceFrom)}
                          </p>

                          {listing.isNegotiable && (
                            <p
                              className="
                                  mt-0.5
                                  text-[10px]
                                  font-bold
                                  text-emerald-600
                                "
                            >
                              Bisa nego
                            </p>
                          )}
                        </div>
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
                  justify-between
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-3
                "
              >
                <button
                  type="button"
                  disabled={!discovery.canGoPrevious || discovery.loading}
                  onClick={discovery.onPreviousPage}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:border-indigo-200
                    hover:text-indigo-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                    "
                  />

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
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Halaman {discovery.currentPage} dari {discovery.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!discovery.canGoNext || discovery.loading}
                  onClick={discovery.onNextPage}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:border-indigo-200
                    hover:text-indigo-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <span
                    className="
                      hidden
                      sm:inline
                    "
                  >
                    Berikutnya
                  </span>

                  <ChevronRight
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                    "
                  />
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
