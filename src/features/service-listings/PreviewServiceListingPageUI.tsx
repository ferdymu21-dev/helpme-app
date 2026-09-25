"use client";

import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Eye,
  Globe2,
  Images,
  Info,
  LoaderCircle,
  MapPin,
  PackageCheck,
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

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
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

function getStatusClassName(status: ProviderServiceListing["status"]): string {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "border-slate-200 bg-slate-100 text-slate-700";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "border-amber-200 bg-amber-50 text-amber-700";

    case ServiceListingStatus.ACTIVE:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case ServiceListingStatus.PAUSED:
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case ServiceListingStatus.EXPIRED:
      return "border-orange-200 bg-orange-50 text-orange-700";

    case ServiceListingStatus.BLOCKED:
      return "border-rose-200 bg-rose-50 text-rose-700";

    case ServiceListingStatus.ARCHIVED:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getStatusDescription(
  status: ProviderServiceListing["status"],
): string {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "Jasa belum ditampilkan kepada pelanggan.";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Selesaikan pembayaran untuk melanjutkan publikasi.";

    case ServiceListingStatus.ACTIVE:
      return "Jasa dapat ditemukan dan diminta oleh pelanggan.";

    case ServiceListingStatus.PAUSED:
      return "Jasa disembunyikan sementara dari pelanggan.";

    case ServiceListingStatus.EXPIRED:
      return "Masa publikasi jasa telah berakhir.";

    case ServiceListingStatus.BLOCKED:
      return "Publikasi jasa sedang dibatasi oleh HelpMe.";

    case ServiceListingStatus.ARCHIVED:
      return "Jasa telah diarsipkan.";
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

function getPublicationActionDescription(
  status: ProviderServiceListing["status"],
): string | null {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "Publikasikan jasa agar dapat ditemukan dan diminta oleh pelanggan.";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Selesaikan pembayaran agar proses publikasi jasa dapat dilanjutkan.";

    case ServiceListingStatus.ACTIVE:
      return "Perpanjang masa aktif jasa selama 30 hari agar tetap dapat ditemukan pelanggan.";

    case ServiceListingStatus.PAUSED:
      return "Perpanjang masa aktif jasa selama 30 hari meskipun jasa sedang dijeda.";

    case ServiceListingStatus.EXPIRED:
      return "Perpanjang jasa agar kembali aktif dan dapat ditemukan oleh pelanggan.";

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

  const publicationActionDescription =
    getPublicationActionDescription(listing.status);

  const formattedExpiresAt = formatDate(listing.expiresAt);

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
    bg-white/95
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
      hover:text-slate-950
      active:scale-95
    "
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </button>

          <div
            className="
      min-w-0
      flex-1
      px-3
    "
          >
            <h1
              className="
        text-base
        font-black
        text-slate-950
      "
            >
              Kelola Jasa
            </h1>

            <p
              className="
        mt-0.5
        text-[11px]
        text-slate-500
      "
            >
              Publikasikan, perpanjang, dan atur status jasa
            </p>
          </div>
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
    gap-3
    rounded-2xl
    border
    border-indigo-100
    bg-indigo-50
    p-4
  "
          >
            <span
              className="
      inline-flex
      h-8
      w-8
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-white
      text-indigo-600
    "
            >
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            </span>

            <div>
              <p
                className="
        text-sm
        font-black
        text-indigo-950
      "
              >
                Siapkan jasa untuk pelanggan
              </p>

              <p
                className="
        mt-1
        text-xs
        leading-5
        text-indigo-700
      "
              >
                Cek status, lakukan publikasi, lalu lihat tampilan jasa
                seperti yang akan dilihat pelanggan.
              </p>
            </div>
          </div>

          <section
            className="
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    shadow-sm
    sm:p-6
  "
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
                <p
                  className="
          inline-flex
          items-center
          gap-1.5
          text-[10px]
          font-bold
          tracking-wide
          text-slate-400
          uppercase
        "
                >
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  Status publikasi
                </p>

                <h2
                  className="
          mt-2
          text-xl
          font-black
          tracking-tight
          text-slate-950
        "
                >
                  {getStatusLabel(listing.status)}
                </h2>

                <p
                  className="
          mt-1
          max-w-md
          text-xs
          leading-5
          text-slate-500
        "
                >
                  {getStatusDescription(listing.status)}
                </p>
              </div>

              <span
                className={`
        inline-flex
        shrink-0
        items-center
        rounded-lg
        border
        px-2.5
        py-1.5
        text-[10px]
        font-bold
        ${getStatusClassName(listing.status)}
      `}
              >
                {getStatusLabel(listing.status)}
              </span>
            </div>

            {formattedExpiresAt && (
              <div
                className="
        mt-4
        flex
        items-center
        gap-2
        border-t
        border-slate-100
        pt-4
        text-xs
        text-slate-500
      "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="
          h-4
          w-4
          shrink-0
        "
                />

                <span>
                  Masa aktif sampai{" "}
                  <strong
                    className="
            font-bold
            text-slate-700
          "
                  >
                    {formattedExpiresAt}
                  </strong>
                </span>
              </div>
            )}

            {listing.status === ServiceListingStatus.BLOCKED &&
              listing.blockedReason && (
                <div
                  className="
          mt-4
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          px-4
          py-3
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
        rounded-xl
        border
        border-emerald-200
        bg-emerald-50
        px-4
        py-3
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
        rounded-xl
        border
        border-amber-200
        bg-amber-50
        px-4
        py-3
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
        rounded-xl
        border
        border-rose-200
        bg-rose-50
        px-4
        py-3
        text-xs
        leading-5
        text-rose-700
      "
              >
                <CircleAlert
                  aria-hidden="true"
                  className="
          mt-0.5
          h-4
          w-4
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
          rounded-xl
          bg-slate-50
          px-4
          py-3
        "
                >
                  <div>
                    <p
                      className="
              text-[10px]
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
                    aria-hidden="true"
                    className="
            h-4
            w-4
            animate-spin
            text-indigo-600
          "
                  />
                </div>
              )}

            <div
              className="
                mt-5
                space-y-2
              "
            >
              {publicationActionLabel && (
                <>
                  <div
                    className="
                      rounded-xl
                      border
                      border-indigo-100
                      bg-indigo-50/70
                      px-4
                      py-3.5
                    "
                  >
                    <p className="text-[10px] font-black tracking-wide text-indigo-500 uppercase">
                      Langkah berikutnya
                    </p>

                    {publicationActionDescription && (
                      <p className="mt-1 text-xs leading-5 text-indigo-800">
                        {publicationActionDescription}
                      </p>
                    )}
                  </div>

                  <button
                  type="button"
                  disabled={actionBusy}
                  onClick={onPublication}
                  className="
          inline-flex
          min-h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-indigo-600
          px-4
          text-xs
          font-black
          text-white
          transition
          hover:bg-indigo-700
          active:scale-[0.99]
          disabled:cursor-wait
          disabled:bg-slate-300
        "
                >
                  {publicationBusy ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="
                h-4
                w-4
                animate-spin
              "
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Rocket aria-hidden="true" className="h-4 w-4" />

                      {publicationActionLabel}
                    </>
                  )}
                  </button>
                </>
              )}

              <div
                className="
    grid
    grid-cols-2
    gap-2
  "
              >
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={onEdit}
                  className="
      inline-flex
      min-h-11
      items-center
      justify-center
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-white
      px-3
      text-xs
      font-black
      text-slate-700
      transition
      hover:border-indigo-200
      hover:bg-indigo-50
      hover:text-indigo-700
      disabled:cursor-wait
      disabled:opacity-50
    "
                >
                  <PencilLine aria-hidden="true" className="h-4 w-4" />
                  Edit jasa
                </button>

                {canPause && (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={onPause}
                    className="
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        text-xs
        font-black
        text-slate-700
        transition
        hover:border-indigo-200
        hover:bg-indigo-50
        hover:text-indigo-700
        disabled:cursor-wait
        disabled:opacity-50
      "
                  >
                    {lifecycleBusy ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="
            h-4
            w-4
            animate-spin
          "
                      />
                    ) : (
                      <Pause aria-hidden="true" className="h-4 w-4" />
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
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        text-xs
        font-black
        text-slate-700
        transition
        hover:border-indigo-200
        hover:bg-indigo-50
        hover:text-indigo-700
        disabled:cursor-wait
        disabled:opacity-50
      "
                  >
                    {lifecycleBusy ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="
            h-4
            w-4
            animate-spin
          "
                      />
                    ) : (
                      <Play aria-hidden="true" className="h-4 w-4" />
                    )}
                    Aktifkan
                  </button>
                )}
              </div>
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

          <div
            className="
    flex
    items-center
    gap-2
    pt-2
  "
          >
            <Eye
              aria-hidden="true"
              className="
      h-4
      w-4
      text-indigo-600
    "
            />

            <div>
              <p
                className="
        text-sm
        font-black
        text-slate-950
      "
              >
                Preview pelanggan
              </p>

              <p
                className="
        mt-0.5
        text-[11px]
        text-slate-500
      "
              >
                Tampilan jasa yang dilihat pelanggan.
              </p>
            </div>
          </div>

          <article
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
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
                  Mulai dari
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
                    Bisa nego
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
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
  "
          >
            <div className="p-5 sm:p-6">
              <div
                className="
        flex
        items-center
        gap-3
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
          rounded-lg
          bg-indigo-50
          text-indigo-600
        "
                >
                  <Info aria-hidden="true" className="h-4 w-4" />
                </span>

                <h3
                  className="
          text-[12px]
          font-black
          text-slate-950
        "
                >
                  Tentang jasa
                </h3>
              </div>

              <p
                className="
        mt-1
        whitespace-pre-wrap
        text-[11px]
        leading-5
        text-slate-600
      "
              >
                {listing.description}
              </p>
            </div>

            <div
              className="
      border-t
      border-slate-100
      p-5
      sm:p-6
    "
            >
              <div
                className="
        flex
        items-center
        gap-3
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
          rounded-lg
          bg-indigo-50
          text-indigo-600
        "
                >
                  <PackageCheck aria-hidden="true" className="h-4 w-4" />
                </span>

                <h3 className="text-[12px] font-black text-slate-950">
                  Yang didapat pelanggan
                </h3>
              </div>

              <p
                className="
        mt-1
        whitespace-pre-wrap
        text-[11px]
        leading-5
        text-slate-600
      "
              >
                {listing.deliverables}
              </p>
            </div>

            {listing.customerPreparation && (
              <div
                className="
        border-t
        border-slate-100
        p-5
        sm:p-6
      "
              >
                <div className="flex items-center gap-3">
                  <span
                    className="
            inline-flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-indigo-50
            text-indigo-600
          "
                  >
                    <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                  </span>

                  <h3 className="text-[12px] font-black text-slate-950">
                    Yang perlu disiapkan
                  </h3>
                </div>

                <p
                  className="
          mt-1
          whitespace-pre-wrap
          text-[11px]
          leading-5
          text-slate-600
        "
                >
                  {listing.customerPreparation}
                </p>
              </div>
            )}
          </section>

          {portfolio.length > 0 && (
            <section
              className="
                rounded-2xl
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className="
      inline-flex
      h-6
      w-6
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                >
                  <Images aria-hidden="true" className="h-4 w-4" />
                </span>

                <h3 className="text-[12px] font-black text-slate-950">
                  Portfolio
                </h3>
              </div>

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