import Link from "next/link";

import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
} from "lucide-react";

import { ServiceListingStatus } from "./constants/service-listing-status";

import { ServiceMode } from "./constants/service-mode";

import type {
  MyServiceListingStatusCounts,
  ProviderServiceListing,
} from "./types/service-listing-read.types";

import { getServiceListingMediaPublicUrl } from "./utils/service-listing-media-url";

interface MyServicesPageUIProps {
  items: ProviderServiceListing[];

  totalCount: number;

  statusCounts: MyServiceListingStatusCounts;

  selectedStatus:
    | ProviderServiceListing["status"]
    | null;

  page: number;

  totalPages: number;

  loading: boolean;

  errorMessage: string | null;

  refresh: () => void;

  onStatusChange: (
    status:
      | ProviderServiceListing["status"]
      | null,
  ) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const timestamp =
    new Date(value);

  if (
    Number.isNaN(
      timestamp.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "long",
    },
  ).format(timestamp);
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

function getStatusClassName(
  status: ProviderServiceListing["status"],
): string {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "border-slate-200 bg-white text-slate-600";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "border-amber-200 bg-amber-50 text-amber-700";

    case ServiceListingStatus.ACTIVE:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case ServiceListingStatus.PAUSED:
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case ServiceListingStatus.EXPIRED:
      return "border-orange-200 bg-orange-50 text-orange-700";

    case ServiceListingStatus.BLOCKED:
      return "border-red-200 bg-red-50 text-red-700";

    case ServiceListingStatus.ARCHIVED:
      return "border-slate-200 bg-slate-100 text-slate-600";
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

function getLifecycleContext(
  listing: ProviderServiceListing,
): string | null {
  switch (listing.status) {
    case ServiceListingStatus.DRAFT:
      return "Belum dipublikasikan";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Menunggu penyelesaian publikasi";

    case ServiceListingStatus.ACTIVE: {
      const expiresAt = formatDate(
        listing.expiresAt,
      );

      return expiresAt
        ? `Aktif sampai ${expiresAt}`
        : "Jasa sedang aktif";
    }

    case ServiceListingStatus.PAUSED: {
      const expiresAt = formatDate(
        listing.expiresAt,
      );

      return expiresAt
        ? `Dijeda, masa aktif sampai ${expiresAt}`
        : "Publikasi sedang dijeda";
    }

    case ServiceListingStatus.EXPIRED: {
      const expiresAt = formatDate(
        listing.expiresAt,
      );

      return expiresAt
        ? `Masa aktif berakhir ${expiresAt}`
        : "Masa aktif telah berakhir";
    }

    case ServiceListingStatus.BLOCKED:
      return listing.blockedReason
        ? `Diblokir: ${listing.blockedReason}`
        : "Diblokir oleh HelpMe";

    case ServiceListingStatus.ARCHIVED: {
      const archivedAt = formatDate(
        listing.archivedAt,
      );

      return archivedAt
        ? `Diarsipkan ${archivedAt}`
        : "Jasa telah diarsipkan";
    }
  }
}

function ServiceListingSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        md:grid-cols-2
        lg:gap-5
      "
    >
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
          "
        >
          <div
            className="
              aspect-16/8
              animate-pulse
              bg-slate-200
            "
          />

          <div className="p-5">
            <div
              className="
                h-3
                w-24
                animate-pulse
                rounded
                bg-slate-200
              "
            />

            <div
              className="
                mt-3
                h-6
                w-3/4
                animate-pulse
                rounded
                bg-slate-200
              "
            />

            <div
              className="
                mt-5
                h-20
                animate-pulse
                rounded-xl
                bg-slate-100
              "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyServicesPageUI({
  items,
  totalCount,
  statusCounts,
  selectedStatus,
  page,
  totalPages,
  loading,
  errorMessage,
  refresh,
  onStatusChange,
  onPreviousPage,
  onNextPage,
}: MyServicesPageUIProps) {

  const actionRequiredCount =
  statusCounts.paymentPendingCount +
  statusCounts.expiredCount +
  statusCounts.blockedCount;

const statusFilters: Array<{
  label: string;
  value:
    | ProviderServiceListing["status"]
    | null;
  count: number;
}> = [
  {
    label: "Semua",
    value: null,
    count: statusCounts.totalCount,
  },
  {
    label: "Aktif",
    value: ServiceListingStatus.ACTIVE,
    count: statusCounts.activeCount,
  },
  {
    label: "Draft",
    value: ServiceListingStatus.DRAFT,
    count: statusCounts.draftCount,
  },
  {
    label: "Pending",
    value:
      ServiceListingStatus.PAYMENT_PENDING,
    count:
      statusCounts.paymentPendingCount,
  },
  {
    label: "Dijeda",
    value: ServiceListingStatus.PAUSED,
    count: statusCounts.pausedCount,
  },
  {
    label: "Kedaluwarsa",
    value: ServiceListingStatus.EXPIRED,
    count: statusCounts.expiredCount,
  },
];

  return (
  <main
    className="
      min-h-screen
      bg-slate-50
      px-4
      py-6
      pb-24
      sm:px-6
      sm:py-8
      lg:px-8
      lg:pb-14
    "
  >
    <div
      className="
        mx-auto
        max-w-6xl
      "
    >
      {/* HEADER */}
      <div
  className="
    flex
    flex-col
    gap-5
    sm:flex-row
    sm:items-end
    sm:justify-between
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
        hover:text-slate-950
        active:scale-95
      "
    >
      <ArrowLeft
        aria-hidden="true"
        className="h-4 w-4"
      />
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
        Jasa Saya
      </h1>

      <p
        className="
          max-w-xl
          text-[11px]
          leading-5
          text-slate-500
        "
      >
        Kelola jasa yang kamu
        tawarkan dan pantau status
        publikasinya.
      </p>
    </div>
  </div>

  <Link
    href="/my-services/new"
    className="
      inline-flex
      min-h-11
      w-full
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-indigo-600
      px-5
      text-sm
      font-black
      text-white
      shadow-sm
      transition
      hover:bg-indigo-700
      active:scale-[0.99]
      sm:w-auto
    "
  >
    <Plus
      aria-hidden="true"
      className="h-4 w-4"
    />

    Tawarkan Jasa
  </Link>
</div>

      {/* SUMMARY */}
<div
  className="
    mt-6
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
  "
>
  <div
    className="
      grid
      grid-cols-3
      divide-x
      divide-slate-100
    "
  >
    <div
      className="
        px-3
        py-4
        sm:px-5
      "
    >
      <p
        className="
          text-xl
          font-black
          tracking-tight
          text-emerald-600
        "
      >
        {statusCounts.activeCount}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          font-bold
          text-slate-500
          sm:text-xs
        "
      >
        Aktif
      </p>
    </div>

    <div
      className="
        px-3
        py-4
        sm:px-5
      "
    >
      <p
        className="
          text-xl
          font-black
          tracking-tight
          text-slate-700
        "
      >
        {statusCounts.draftCount}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          font-bold
          text-slate-500
          sm:text-xs
        "
      >
        Draft
      </p>
    </div>

    <div
      className="
        px-3
        py-4
        sm:px-5
      "
    >
      <p
        className={`
          text-xl
          font-black
          tracking-tight
          ${
            actionRequiredCount > 0
              ? "text-amber-600"
              : "text-slate-700"
          }
        `}
      >
        {actionRequiredCount}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          font-bold
          leading-4
          text-slate-500
          sm:text-xs
        "
      >
        Perlu tindakan
      </p>
    </div>
  </div>
</div>

{/* STATUS FILTER */}
<div
  className="
    -mx-4
    mt-4
    overflow-x-auto
    px-4
    pb-1
    sm:mx-0
    sm:px-0
  "
>
  <div
    className="
      flex
      w-max
      min-w-full
      gap-2
    "
  >
    {statusFilters.map(
      (filter) => {
        const active =
          selectedStatus ===
          filter.value;

        return (
          <button
            key={
              filter.value ??
              "ALL"
            }
            type="button"
            onClick={() =>
              onStatusChange(
                filter.value,
              )
            }
            className={`
              inline-flex
              min-h-9
              shrink-0
              items-center
              gap-1.5
              rounded-xl
              border
              px-3
              text-xs
              font-bold
              transition
              ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              }
            `}
          >
            {filter.label}

            <span
              className={`
                rounded-md
                px-1.5
                py-0.5
                text-[9px]
                font-black
                ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {filter.count}
            </span>
          </button>
        );
      },
    )}
  </div>
</div>

<div
  className="
    mt-4
    flex
    items-center
    justify-between
    gap-3
    border-b
    border-slate-200
    pb-3
  "
>
  <p
    className="
      text-xs
      text-slate-500
    "
  >
    <span
      className="
        font-black
        text-slate-900
      "
    >
      {totalCount}
    </span>{" "}
    jasa pada tampilan ini
  </p>

  {loading &&
  items.length > 0 ? (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        text-[10px]
        font-bold
        text-slate-500
      "
    >
      <RefreshCw
        aria-hidden="true"
        className="
          h-3
          w-3
          animate-spin
        "
      />

      Memperbarui
    </span>
  ) : (
    <button
      type="button"
      onClick={refresh}
      aria-label="Muat ulang Jasa Saya"
      title="Muat ulang"
      className="
        inline-flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        text-slate-400
        transition
        hover:bg-slate-100
        hover:text-indigo-600
      "
    >
      <RefreshCw
        aria-hidden="true"
        className="h-3.5 w-3.5"
      />
    </button>
  )}
</div>

      {/* ERROR */}
      {errorMessage && (
        <section
          className="
            mt-5
            rounded-2xl
            border
            border-red-200
            bg-white
            p-5
          "
        >
          <p
            className="
              font-black
              text-slate-950
            "
          >
            Jasa kamu belum dapat
            dimuat
          </p>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-red-600
            "
          >
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="
              mt-4
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-200
              px-4
              text-xs
              font-bold
              text-red-600
              transition
              hover:bg-red-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Coba lagi
          </button>
        </section>
      )}

      {/* LOADING */}
      {!errorMessage &&
        loading &&
        items.length === 0 && (
          <div className="mt-5">
            <ServiceListingSkeleton />
          </div>
        )}

      {/* EMPTY */}
      {!errorMessage &&
        !loading &&
        items.length === 0 && (
          <section
            className="
              mt-5
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-12
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <BriefcaseBusiness
                aria-hidden="true"
                className="h-6 w-6"
              />
            </div>

            <h2
              className="
                mt-4
                text-lg
                font-black
                text-slate-950
              "
            >
              {selectedStatus === null
                ? "Belum ada jasa"
                : "Tidak ada jasa pada status ini"}
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
              {selectedStatus === null
                ? "Mulai tawarkan kemampuanmu agar pelanggan dapat menemukan dan mengajukan permintaan jasa."
                : "Belum ada jasa yang cocok dengan status yang dipilih."}
            </p>
            {selectedStatus === null ? (
            <Link
              href="/my-services/new"
              className="
                mt-5
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-black
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4"
              />

              Tawarkan Jasa
            </Link>
            ) : (
  <button
    type="button"
    onClick={() =>
      onStatusChange(null)
    }
    className="
      mt-5
      inline-flex
      min-h-11
      items-center
      justify-center
      rounded-xl
      border
      border-slate-200
      bg-white
      px-5
      text-sm
      font-black
      text-slate-700
      transition
      hover:border-indigo-200
      hover:bg-indigo-50
      hover:text-indigo-700
    "
  >
    Lihat semua jasa
  </button>
)}
          </section>
        )}

      {/* LIST */}
      {!errorMessage &&
        items.length > 0 && (
          <div
            className="
              mt-5
              grid
              gap-4
              md:grid-cols-2
              lg:gap-5
            "
          >
            {items.map((listing) => {
              const coverUrl =
                getServiceListingMediaPublicUrl(
                  listing.coverStoragePath,
                );

              const lifecycleContext =
                getLifecycleContext(
                  listing,
                );

              return (
                <article
                  key={listing.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    hover:border-indigo-200
                    hover:shadow-md
                  "
                >
                  {/* COVER */}
                  <div
                    className="
                      relative
                      aspect-16/8
                      overflow-hidden
                      bg-slate-100
                    "
                  >
                    {coverUrl ? (
                      <div
                        role="img"
                        aria-label={`Cover ${listing.title}`}
                        className="
                          h-full
                          w-full
                          bg-cover
                          bg-center
                          transition
                          duration-300
                          hover:scale-[1.01]
                        "
                        style={{
                          backgroundImage: `url(${JSON.stringify(
                            coverUrl,
                          )})`,
                        }}
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          items-center
                          justify-center
                          text-slate-400
                        "
                      >
                        <ImageIcon
                          aria-hidden="true"
                          className="h-8 w-8"
                        />
                      </div>
                    )}

                    <span
                      className={`
                        absolute
                        top-3
                        left-3
                        inline-flex
                        items-center
                        rounded-lg
                        border
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        shadow-sm
                        backdrop-blur-sm
                        ${getStatusClassName(
                          listing.status,
                        )}
                      `}
                    >
                      {getStatusLabel(
                        listing.status,
                      )}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-5">
                    <p
                      className="
                        text-[10px]
                        font-bold
                        tracking-wide
                        text-indigo-600
                        uppercase
                      "
                    >
                      {listing.category}
                    </p>

                    <h2
                      className="
                        mt-1.5
                        line-clamp-2
                        text-lg
                        font-black
                        leading-6
                        tracking-tight
                        text-slate-950
                      "
                    >
                      {listing.title}
                    </h2>

                    {/* PRICE */}
                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-end
                        gap-2
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
                            text-lg
                            font-black
                            tracking-tight
                            text-indigo-700
                          "
                        >
                          {formatPrice(
                            listing.priceFrom,
                          )}
                        </p>
                      </div>

                      {listing.isNegotiable && (
                        <span
                          className="
                            mb-0.5
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

                    {/* MODE */}
                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-x-3
                        gap-y-2
                        text-[11px]
                        text-slate-500
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                        "
                      >
                        <Globe2
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />

                        {getModeLabel(
                          listing.serviceMode,
                        )}
                      </span>

                      {listing.locationName && (
                        <span
                          className="
                            inline-flex
                            min-w-0
                            items-center
                            gap-1.5
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
                            {
                              listing.locationName
                            }
                          </span>
                        </span>
                      )}
                    </div>

                    {/* LIFECYCLE */}
                    {lifecycleContext && (
                      <div
                        className="
                          mt-4
                          flex
                          items-start
                          gap-2
                          border-t
                          border-slate-100
                          pt-4
                          text-[11px]
                          leading-5
                          text-slate-500
                        "
                      >
                        <Clock3
                          aria-hidden="true"
                          className="
                            mt-0.5
                            h-3.5
                            w-3.5
                            shrink-0
                          "
                        />

                        <span>
                          {lifecycleContext}
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div
  className="
    mt-5
    grid
    grid-cols-2
    gap-2
  "
>
  <Link
    href={`/my-services/${listing.id}/preview`}
    className="
      inline-flex
      min-h-10
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-indigo-600
      px-3
      text-xs
      font-black
      text-white
      transition
      hover:bg-indigo-700
      active:scale-[0.99]
    "
  >
    <Settings2
      aria-hidden="true"
      className="h-4 w-4"
    />

    Kelola Jasa
  </Link>

  <Link
    href={`/my-services/${listing.id}/edit`}
    className="
      inline-flex
      min-h-10
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
      active:scale-[0.99]
    "
  >
    <Pencil
      aria-hidden="true"
      className="h-4 w-4"
    />

    Edit
  </Link>
</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {/* PAGINATION */}
      {!errorMessage &&
        items.length > 0 &&
        (totalPages > 1 ||
          page > 1) && (
          <nav
            aria-label="Pagination Jasa Saya"
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
              onClick={onPreviousPage}
              disabled={
                loading || page <= 1
              }
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
              <ChevronLeft
                aria-hidden="true"
                className="h-4 w-4"
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
                min-w-24
                text-center
                text-xs
                font-bold
                text-slate-500
              "
            >
              {page}
              {" / "}
              {totalPages}
            </p>

            <button
              type="button"
              onClick={onNextPage}
              disabled={
                loading ||
                page >= totalPages
              }
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
                className="
                  hidden
                  sm:inline
                "
              >
                Berikutnya
              </span>

              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>
          </nav>
        )}
    </div>
  </main>
);
}