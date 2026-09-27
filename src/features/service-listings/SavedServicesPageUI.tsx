"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MapPin,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

import ServiceSaveButton from "./components/ServiceSaveButton";

import { useSavedServiceListings } from "./hooks/useSavedServiceListings";

import { useSavedServicesPage } from "./hooks/useSavedServicesPage";

import { getServiceListingMediaPublicUrl } from "./utils/service-listing-media-url";

const PRICE_FORMATTER =
  new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  );

function getProviderName(
  fullName: string | null,
  username: string | null,
): string {
  const normalizedFullName =
    fullName?.trim();

  if (normalizedFullName) {
    return normalizedFullName;
  }

  const normalizedUsername =
    username?.trim();

  if (normalizedUsername) {
    return normalizedUsername;
  }

  return "Penyedia Jasa";
}

function isVerified(
  verificationStatus:
    | string
    | null,
): boolean {
  if (!verificationStatus) {
    return false;
  }

  const normalized =
    verificationStatus
      .trim()
      .toUpperCase();

  return (
    normalized === "VERIFIED" ||
    normalized === "APPROVED"
  );
}

export default function SavedServicesPageUI() {
  const savedPage =
    useSavedServicesPage();

  const saved =
    useSavedServiceListings();

  async function handleToggle(
    listingId: string,
  ) {
    const result =
      await saved.toggleSaved(
        listingId,
      );

    if (
      result === "UNSAVED"
    ) {
      savedPage.removeItem(
        listingId,
      );
    }

    return result;
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        pb-28
        lg:pb-16
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
            py-6
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <Link
              href="/profile"
              aria-label="Kembali ke profil"
              className="
                mt-0.5
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:border-indigo-200
                hover:text-indigo-700
              "
            >
              <ArrowLeft
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />
            </Link>

            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h1
                  className="
                    text-[12px]
                    font-black
                    tracking-tight
                    text-slate-950
                    sm:text-2xl
                  "
                >
                  Jasa Tersimpan
                </h1>
              </div>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-[11px]
                  leading-4
                  text-slate-500
                "
              >
                Simpan jasa yang menarik agar lebih mudah ditemukan saat Anda membutuhkannya.
              </p>
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
        {!savedPage.loading &&
          !savedPage.errorMessage && (
            <div
              className="
                mb-5
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                {savedPage.totalCount === null
                  ? "Jasa yang Anda simpan"
                  : `${savedPage.totalCount} jasa tersimpan`}
              </p>

              <Link
                href="/services"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-bold
                  text-indigo-600
                  hover:text-indigo-700
                "
              >
                <Search
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />
                Cari jasa
              </Link>
            </div>
          )}

        {savedPage.loading && (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {Array.from(
              { length: 6 },
            ).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    h-96
                    animate-pulse
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                  "
                />
              ),
            )}
          </div>
        )}

        {!savedPage.loading &&
          savedPage.errorMessage && (
            <div
              className="
                rounded-3xl
                border
                border-rose-200
                bg-white
                px-6
                py-12
                text-center
              "
            >
              <p
                className="
                  font-bold
                  text-slate-900
                "
              >
                Jasa tersimpan belum dapat dimuat
              </p>

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
                {savedPage.errorMessage}
              </p>

              <button
                type="button"
                onClick={
                  savedPage.refresh
                }
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-slate-800
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
          )}

        {!savedPage.loading &&
          !savedPage.errorMessage &&
          savedPage.items.length ===
            0 && (
            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                px-6
                py-14
                text-center
                shadow-sm
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Bookmark
                  aria-hidden="true"
                  className="
                    h-6
                    w-6
                  "
                />
              </div>

              <h2
                className="
                  mt-5
                  text-lg
                  font-black
                  text-slate-950
                "
              >
                Belum ada jasa tersimpan
              </h2>

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
                Temukan jasa yang menarik lalu tekan ikon simpan agar bisa Anda lihat kembali di sini.
              </p>

              <Link
                href="/services"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-indigo-700
                "
              >
                <Search
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />
                Cari Jasa
              </Link>
            </div>
          )}

        {!savedPage.loading &&
          !savedPage.errorMessage &&
          savedPage.items.length >
            0 && (
            <>
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {savedPage.items.map(
                  (listing) => {
                    const coverUrl =
                      getServiceListingMediaPublicUrl(
                        listing.coverStoragePath,
                      );

                    const providerName =
                      getProviderName(
                        listing.provider.fullName,
                        listing.provider.username,
                      );

                    const verified =
                      isVerified(
                        listing.provider.verificationStatus,
                      );

                    return (
                      <article
                        key={listing.id}
                        className="
                          relative
                          min-w-0
                        "
                      >
                        <Link
                          href={`/services/${listing.id}`}
                          className="
                            group
                            block
                            h-full
                            overflow-hidden
                            rounded-3xl
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
                                  bg-linear-to-br
                                  from-indigo-50
                                  to-slate-100
                                "
                              >
                                <Bookmark
                                  aria-hidden="true"
                                  className="
                                    h-8
                                    w-8
                                    text-indigo-300
                                  "
                                />
                              </div>
                            )}

                            <div
                              className="
                                absolute
                                left-3
                                top-3
                                rounded-full
                                bg-slate-950/75
                                px-3
                                py-1.5
                                text-[11px]
                                font-bold
                                text-white
                                backdrop-blur
                              "
                            >
                              {listing.category}
                            </div>
                          </div>

                          <div className="p-5">
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                font-semibold
                                text-slate-500
                              "
                            >
                              <span
                                className="
                                  truncate
                                "
                              >
                                {providerName}
                              </span>

                              {verified && (
                                <CircleCheck
                                  aria-label="Penyedia terverifikasi"
                                  className="
                                    h-4
                                    w-4
                                    shrink-0
                                    fill-indigo-600
                                    text-white
                                  "
                                />
                              )}

                              {listing.provider.rating !==
                                null && (
                                <>
                                  <span>
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
                                      className="
                                        h-3.5
                                        w-3.5
                                        fill-amber-400
                                        text-amber-400
                                      "
                                    />
                                    {listing.provider.rating}
                                  </span>
                                </>
                              )}
                            </div>

                            <h2
                              className="
                                mt-3
                                line-clamp-2
                                text-base
                                font-black
                                leading-6
                                text-slate-950
                              "
                            >
                              {listing.title}
                            </h2>

                            <p
                              className="
                                mt-2
                                line-clamp-2
                                text-sm
                                leading-6
                                text-slate-500
                              "
                            >
                              {listing.description}
                            </p>

                            {listing.locationName && (
                              <p
                                className="
                                  mt-3
                                  flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-semibold
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
                              </p>
                            )}

                            <div
                              className="
                                mt-5
                                border-t
                                border-slate-100
                                pt-4
                              "
                            >
                              <p
                                className="
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  tracking-wide
                                  text-slate-400
                                "
                              >
                                Mulai dari
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-lg
                                  font-black
                                  text-indigo-700
                                "
                              >
                                {PRICE_FORMATTER.format(
                                  listing.priceFrom,
                                )}
                              </p>
                            </div>
                          </div>
                        </Link>

                        <div
                          className="
                            absolute
                            right-3
                            top-3
                            z-10
                          "
                        >
                          <ServiceSaveButton
                            listingId={
                              listing.id
                            }
                            isSaved={
                              saved.isSaved(
                                listing.id,
                              )
                            }
                            isPending={
                              saved.isPending(
                                listing.id,
                              )
                            }
                            isAuthenticated={
                              saved.isAuthenticated
                            }
                            loadingState={
                              saved.authLoading ||
                              saved.loading
                            }
                            onToggle={
                              handleToggle
                            }
                          />
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              {savedPage.totalPages >
                1 && (
                <nav
                  aria-label="Pagination jasa tersimpan"
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
                    disabled={
                      !savedPage.canGoPrevious
                    }
                    onClick={
                      savedPage.previousPage
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
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
                    Sebelumnya
                  </button>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-slate-600
                    "
                  >
                    {savedPage.currentPage}
                    {" / "}
                    {savedPage.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      !savedPage.canGoNext
                    }
                    onClick={
                      savedPage.nextPage
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
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
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Selanjutnya
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