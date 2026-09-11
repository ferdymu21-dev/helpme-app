"use client";

import {
  ArrowLeft,
  CircleAlert,
  Clock3,
  Globe2,
  Images,
  LoaderCircle,
  MapPin,
  Pause,
  PencilLine,
  Play,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { ServiceListingImageKind } from "./constants/service-listing-image-kind";

import { ServiceListingStatus } from "./constants/service-listing-status";

import { ServiceMode } from "./constants/service-mode";

import type { ProviderServiceListingMedia } from "./types/service-listing-media.types";

import type { ProviderServiceListing } from "./types/service-listing-read.types";

interface PreviewServiceListingPageUIProps {
  listing: ProviderServiceListing | null;

  media: ProviderServiceListingMedia[];

  loading: boolean;

  errorMessage: string | null;

  publicationBusy: boolean;

  lifecycleBusy: boolean;

  actionErrorMessage: string | null;

  actionSuccessMessage: string | null;

  actionInfoMessage: string | null;

  publicationAmount: number;

  publicationPaymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED"
    | null;

  onBack: () => void;

  onEdit: () => void;

  onPublication: () => void;

  onPause: () => void;

  onResume: () => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function getStatusLabel(status: ProviderServiceListing["status"]): string {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "Draft";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Menunggu pembayaran";

    case ServiceListingStatus.ACTIVE:
      return "Aktif";

    case ServiceListingStatus.PAUSED:
      return "Dijeda";

    case ServiceListingStatus.EXPIRED:
      return "Kedaluwarsa";

    case ServiceListingStatus.BLOCKED:
      return "Diblokir";

    case ServiceListingStatus.ARCHIVED:
      return "Diarsipkan";
  }
}

function getPublicationActionLabel(
  status: ProviderServiceListing["status"],
): string | null {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "Publikasikan jasa";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Lanjutkan pembayaran";

    case ServiceListingStatus.ACTIVE:
    case ServiceListingStatus.PAUSED:
      return "Perpanjang 30 hari";

    case ServiceListingStatus.EXPIRED:
      return "Perpanjang jasa";

    case ServiceListingStatus.BLOCKED:
    case ServiceListingStatus.ARCHIVED:
      return null;
  }
}

function getModeLabel(mode: ProviderServiceListing["serviceMode"]): string {
  switch (mode) {
    case ServiceMode.ONLINE:
      return "Online";

    case ServiceMode.OFFLINE:
      return "Offline";

    case ServiceMode.BOTH:
      return "Online & Offline";
  }
}

function getBackgroundImage(publicUrl: string): string {
  return `url(${JSON.stringify(publicUrl)})`;
}

export default function PreviewServiceListingPageUI({
  listing,
  media,
  loading,
  errorMessage,
  publicationBusy,
  lifecycleBusy,
  actionErrorMessage,
  actionSuccessMessage,
  actionInfoMessage,
  publicationAmount,
  publicationPaymentStatus,
  onBack,
  onEdit,
  onPublication,
  onPause,
  onResume,
}: PreviewServiceListingPageUIProps) {
  if (loading) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50/70
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-indigo-600
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            Memuat preview...
          </p>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50/70
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            text-center
            shadow-sm
          "
        >
          <span
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-rose-50
              text-rose-600
            "
          >
            <CircleAlert size={22} strokeWidth={2} />
          </span>

          <h1
            className="
              mt-4
              text-lg
              font-bold
              text-slate-900
            "
          >
            Preview tidak dapat dibuka
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {errorMessage ??
              "Jasa tidak ditemukan atau Anda tidak memiliki akses."}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="
              mt-5
              h-11
              rounded-xl
              bg-slate-900
              px-5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  const publicationActionLabel = getPublicationActionLabel(listing.status);

  const formattedExpiresAt = formatDateTime(listing.expiresAt);

  const actionBusy = publicationBusy || lifecycleBusy;

  const canPause = listing.status === ServiceListingStatus.ACTIVE;

  const canResume = listing.status === ServiceListingStatus.PAUSED;

  const cover =
    media.find((item) => item.kind === ServiceListingImageKind.COVER) ?? null;

  const portfolio = media
    .filter((item) => item.kind === ServiceListingImageKind.PORTFOLIO)
    .slice()
    .sort((first, second) => first.sortOrder - second.sortOrder);

  return (
    <main
      className="
        min-h-screen
        bg-slate-50/70
        pb-28
        sm:pb-12
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
        "
      >
        <header
          className="
            sticky
            top-0
            z-30
            flex
            items-center
            border-b
            border-slate-200/80
            bg-white/90
            px-4
            py-3
            backdrop-blur-xl
            sm:static
            sm:border-b-0
            sm:bg-transparent
            sm:px-6
            sm:pt-8
            sm:backdrop-blur-none
          "
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            <ArrowLeft size={19} strokeWidth={2.2} />
          </button>

          <div
            className="
              min-w-0
              flex-1
              px-3
              text-center
            "
          >
            <h1
              className="
                text-[15px]
                font-bold
                text-slate-900
              "
            >
              Preview Jasa
            </h1>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              Tampilan jasa milik Anda
            </p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit jasa"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-indigo-600
              shadow-sm
              transition
              hover:bg-indigo-50
            "
          >
            <PencilLine size={17} strokeWidth={2} />
          </button>
        </header>

        <div
          className="
            space-y-4
            px-4
            pt-5
            sm:px-6
            sm:pt-8
          "
        >
          <div
            className="
              flex
              items-start
              gap-2.5
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50
              p-4
            "
          >
            <ShieldCheck
              size={18}
              strokeWidth={2}
              className="
                mt-0.5
                shrink-0
                text-indigo-600
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-bold
                  text-indigo-900
                "
              >
                Ini adalah preview
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-indigo-700
                "
              >
                Periksa kembali tampilan jasa sebelum dipublikasikan. Publikasi,
                pembayaran, perpanjangan, dan pengaturan status jasa dapat
                dilakukan dari halaman ini.
              </p>
            </div>
          </div>

          <section
            className="
              rounded-3xl
              border
              border-slate-200/80
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  <Clock3 size={15} strokeWidth={2} />
                  Status publikasi
                </div>

                <p
                  className="
                    mt-1.5
                    text-lg
                    font-black
                    text-slate-950
                  "
                >
                  {getStatusLabel(listing.status)}
                </p>

                {formattedExpiresAt && (
                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Masa aktif sampai {formattedExpiresAt}
                  </p>
                )}
              </div>

              <span
                className="
                  inline-flex
                  w-fit
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  text-slate-700
                "
              >
                {getStatusLabel(listing.status)}
              </span>
            </div>

            {listing.status === ServiceListingStatus.BLOCKED &&
              listing.blockedReason && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-rose-100
                    bg-rose-50
                    p-3
                    text-xs
                    leading-5
                    text-rose-700
                  "
                >
                  {listing.blockedReason}
                </div>
              )}

            {actionSuccessMessage && (
              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-emerald-50
                  p-3
                  text-xs
                  leading-5
                  text-emerald-700
                "
              >
                {actionSuccessMessage}
              </div>
            )}

            {actionInfoMessage && (
              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-amber-100
                  bg-amber-50
                  p-3
                  text-xs
                  leading-5
                  text-amber-700
                "
              >
                {actionInfoMessage}
              </div>
            )}

            {actionErrorMessage && (
              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-2
                  rounded-2xl
                  border
                  border-rose-100
                  bg-rose-50
                  p-3
                  text-xs
                  leading-5
                  text-rose-700
                "
              >
                <CircleAlert
                  size={15}
                  strokeWidth={2}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>{actionErrorMessage}</span>
              </div>
            )}

            {publicationPaymentStatus === "PENDING" &&
              publicationAmount > 0 && (
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-2xl
                    bg-slate-50
                    px-4
                    py-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[11px]
                        font-bold
                        text-slate-500
                      "
                    >
                      Menunggu konfirmasi pembayaran
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-sm
                        font-black
                        text-slate-900
                      "
                    >
                      {formatPrice(publicationAmount)}
                    </p>
                  </div>

                  <LoaderCircle
                    size={18}
                    strokeWidth={2}
                    className="
                      animate-spin
                      text-indigo-600
                    "
                  />
                </div>
              )}

            <div
              className="
                mt-5
                grid
                gap-2.5
                sm:grid-cols-2
              "
            >
              {publicationActionLabel && (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={onPublication}
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-indigo-600
                    px-4
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-indigo-600/15
                    transition
                    hover:bg-indigo-700
                    disabled:cursor-wait
                    disabled:bg-slate-300
                    disabled:shadow-none
                  "
                >
                  {publicationBusy ? (
                    <>
                      <LoaderCircle
                        size={17}
                        strokeWidth={2}
                        className="animate-spin"
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Rocket size={17} strokeWidth={2} />

                      {publicationActionLabel}
                    </>
                  )}
                </button>
              )}

              {canPause && (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={onPause}
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:cursor-wait
                    disabled:opacity-50
                  "
                >
                  {lifecycleBusy ? (
                    <LoaderCircle
                      size={17}
                      strokeWidth={2}
                      className="animate-spin"
                    />
                  ) : (
                    <Pause size={17} strokeWidth={2} />
                  )}
                  Jeda jasa
                </button>
              )}

              {canResume && (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={onResume}
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:cursor-wait
                    disabled:opacity-50
                  "
                >
                  {lifecycleBusy ? (
                    <LoaderCircle
                      size={17}
                      strokeWidth={2}
                      className="animate-spin"
                    />
                  ) : (
                    <Play size={17} strokeWidth={2} />
                  )}
                  Aktifkan kembali
                </button>
              )}
            </div>

            {listing.status === ServiceListingStatus.PAUSED && (
              <p
                className="
                    mt-3
                    text-[11px]
                    leading-5
                    text-slate-500
                  "
              >
                Menjeda jasa tidak menghentikan masa aktif publikasi.
              </p>
            )}

            {listing.status === ServiceListingStatus.ARCHIVED && (
              <p
                className="
                    mt-4
                    text-xs
                    leading-5
                    text-slate-500
                  "
              >
                Jasa yang sudah diarsipkan tidak dapat dipublikasikan kembali
                dari halaman ini.
              </p>
            )}
          </section>

          <article
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200/80
              bg-white
              shadow-sm
            "
          >
            {cover ? (
              <div
                role="img"
                aria-label="Cover jasa"
                style={{
                  backgroundImage: getBackgroundImage(cover.publicUrl),
                }}
                className="
                  aspect-video
                  w-full
                  bg-slate-100
                  bg-cover
                  bg-center
                "
              />
            ) : (
              <div
                className="
                  flex
                  aspect-video
                  flex-col
                  items-center
                  justify-center
                  bg-slate-100
                  p-6
                  text-center
                "
              >
                <Images
                  size={28}
                  strokeWidth={1.8}
                  className="text-slate-400"
                />

                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Cover belum ditambahkan
                </p>
              </div>
            )}

            <div className="p-5 sm:p-7">
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    bg-indigo-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-indigo-700
                  "
                >
                  {listing.category}
                </span>

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    text-slate-600
                  "
                >
                  {getModeLabel(listing.serviceMode)}
                </span>
              </div>

              <h2
                className="
                  mt-4
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  sm:text-3xl
                "
              >
                {listing.title}
              </h2>

              <div className="mt-4">
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-500
                  "
                >
                  Harga mulai
                </p>

                <p
                  className="
                    mt-1
                    text-xl
                    font-bold
                    text-indigo-700
                  "
                >
                  {formatPrice(listing.priceFrom)}
                </p>

                {listing.isNegotiable && (
                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-emerald-600
                    "
                  >
                    Harga dapat dinegosiasikan
                  </p>
                )}
              </div>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-3
                  text-sm
                  text-slate-600
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <Globe2 size={16} strokeWidth={2} />

                  {getModeLabel(listing.serviceMode)}
                </span>

                {listing.locationName && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                    "
                  >
                    <MapPin size={16} strokeWidth={2} />

                    {listing.locationName}
                  </span>
                )}
              </div>
            </div>
          </article>

          <section
            className="
              rounded-3xl
              border
              border-slate-200/80
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <h3
              className="
                text-base
                font-bold
                text-slate-900
              "
            >
              Tentang jasa ini
            </h3>

            <p
              className="
                mt-3
                whitespace-pre-wrap
                text-sm
                leading-6
                text-slate-600
              "
            >
              {listing.description}
            </p>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-slate-200/80
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <h3
              className="
                text-base
                font-bold
                text-slate-900
              "
            >
              Yang didapat pelanggan
            </h3>

            <p
              className="
                mt-3
                whitespace-pre-wrap
                text-sm
                leading-6
                text-slate-600
              "
            >
              {listing.deliverables}
            </p>
          </section>

          {listing.customerPreparation && (
            <section
              className="
                rounded-3xl
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <h3
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >
                Yang perlu disiapkan pelanggan
              </h3>

              <p
                className="
                  mt-3
                  whitespace-pre-wrap
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {listing.customerPreparation}
              </p>
            </section>
          )}

          {portfolio.length > 0 && (
            <section
              className="
                rounded-3xl
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <h3
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >
                Portfolio
              </h3>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                "
              >
                {portfolio.map((image) => (
                  <div
                    key={image.id}
                    role="img"
                    aria-label={`Portfolio jasa ${image.sortOrder + 1}`}
                    style={{
                      backgroundImage: getBackgroundImage(image.publicUrl),
                    }}
                    className="
                        aspect-square
                        rounded-2xl
                        bg-slate-100
                        bg-cover
                        bg-center
                      "
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}