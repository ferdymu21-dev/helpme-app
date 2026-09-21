import Link from "next/link";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Inbox,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  SERVICE_REQUEST_STATUSES,
  type ServiceRequestStatusValue,
} from "./constants/service-request-status";

import type { ProviderServiceRequestSummary } from "./types/service-request-read.types";

import {
  formatServiceRequestBudget,
  formatServiceRequestDateTime,
  getServiceRequestModeLabel,
  getServiceRequestStatusLabel,
} from "./utils/service-request-display";

interface ProviderServiceRequestsPageUIProps {
  items: ProviderServiceRequestSummary[];

  totalCount: number;

  page: number;

  totalPages: number;

  status: ServiceRequestStatusValue | null;

  loading: boolean;

  errorMessage: string | null;

  refresh: () => void;

  onStatusChange: (status: ServiceRequestStatusValue | null) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

function getCustomerLabel(request: ProviderServiceRequestSummary): string {
  if (request.customerFullName) {
    return request.customerFullName;
  }

  if (request.customerUsername) {
    return `@${request.customerUsername}`;
  }

  return "Customer HelpMe";
}

function getStatusTone(
  status: ServiceRequestStatusValue,
): string {
  const normalizedStatus =
    String(status);

  switch (normalizedStatus) {
    case "PENDING_PROVIDER":
      return `
        border-amber-200
        bg-amber-50
        text-amber-700
      `;

    case "NEGOTIATING":
    case "AGREEMENT_PENDING":
      return `
        border-violet-200
        bg-violet-50
        text-violet-700
      `;

    case "AGREED":
    case "IN_PROGRESS":
      return `
        border-blue-200
        bg-blue-50
        text-blue-700
      `;

    case "SUBMITTED":
      return `
        border-indigo-200
        bg-indigo-50
        text-indigo-700
      `;

    case "COMPLETED":
      return `
        border-emerald-200
        bg-emerald-50
        text-emerald-700
      `;

    case "DECLINED":
    case "CANCELLED":
      return `
        border-rose-200
        bg-rose-50
        text-rose-700
      `;

    default:
      return `
        border-slate-200
        bg-slate-50
        text-slate-600
      `;
  }
}

function RequestSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="
  h-72
  animate-pulse
  rounded-2xl
  border
  border-slate-200
  bg-white
"
        />
      ))}
    </div>
  );
}

export default function ProviderServiceRequestsPageUI({
  items,
  totalCount,
  page,
  totalPages,
  status,
  loading,
  errorMessage,
  refresh,
  onStatusChange,
  onPreviousPage,
  onNextPage,
}: ProviderServiceRequestsPageUIProps) {
  return (
  <main
    className="
      min-h-screen
      bg-slate-50/70
      px-4
      pb-10
      pt-6
      sm:px-6
      lg:px-8
    "
  >
    <div
      className="
        mx-auto
        w-full
        max-w-5xl
      "
    >
      <header
  className="
    flex
    items-start
    gap-3
  "
>
  <Link
    href="/my-services"
    aria-label="Kembali ke Jasa Saya"
    title="Kembali ke Jasa Saya"
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
      className="
        h-4
        w-4
      "
    />
  </Link>

  <div className="min-w-0">
    <h1
      className="
        mt-1
        text-base
        font-black
        tracking-tight
        text-slate-950
        sm:text-3xl
      "
    >
      Permintaan Jasa
    </h1>

    <p
      className="
        mt-2
        max-w-xl
        text-[11px]
        leading-4
        text-slate-500
      "
    >
      Kelola permintaan pelanggan untuk
      jasa yang Anda tawarkan.
    </p>
  </div>
</header>

      <div
        className="
          -mx-4
          mt-6
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
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              onStatusChange(null)
            }
            className={`
              shrink-0
              rounded-xl
              border
              px-3.5
              py-2.5
              text-xs
              font-bold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50

              ${
                status === null
                  ? `
                    border-indigo-600
                    bg-indigo-600
                    text-white
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-600
                    hover:border-indigo-200
                    hover:text-indigo-700
                  `
              }
            `}
          >
            Semua
          </button>

          {SERVICE_REQUEST_STATUSES.map(
            (requestStatus) => {
              const selected =
                status ===
                requestStatus;

              return (
                <button
                  key={requestStatus}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    onStatusChange(
                      requestStatus,
                    )
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    border
                    px-3.5
                    py-2.5
                    text-xs
                    font-bold
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    ${
                      selected
                        ? `
                          border-indigo-600
                          bg-indigo-600
                          text-white
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-600
                          hover:border-indigo-200
                          hover:text-indigo-700
                        `
                    }
                  `}
                >
                  {getServiceRequestStatusLabel(
                    requestStatus,
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          gap-4
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-medium
              text-slate-400
            "
          >
            {status
              ? "Hasil filter"
              : "Semua permintaan"}
          </p>

          <p
            className="
              mt-0.5
              text-sm
              font-bold
              text-slate-900
            "
          >
            {totalCount} permintaan
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="
            inline-flex
            h-10
            items-center
            gap-2
            rounded-xl
            px-3
            text-xs
            font-bold
            text-slate-600
            transition
            hover:bg-slate-50
            hover:text-slate-950
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            strokeWidth={2}
            className={
              loading
                ? "animate-spin"
                : undefined
            }
          />

          Muat ulang
        </button>
      </div>

      <section className="mt-4">
        {loading &&
        items.length === 0 ? (
          <RequestSkeleton />
        ) : errorMessage ? (
          <div
            className="
              rounded-2xl
              border
              border-rose-200
              bg-white
              p-7
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
                rounded-2xl
                bg-rose-50
                text-rose-600
              "
            >
              <RefreshCw
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className="
                mt-4
                text-base
                font-black
                text-slate-950
              "
            >
              Permintaan belum dapat dimuat
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-rose-600
              "
            >
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={refresh}
              className="
                mt-5
                h-11
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-6
              py-10
              text-center
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
                bg-slate-100
                text-slate-500
              "
            >
              <Inbox
                size={25}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className="
                mt-4
                text-base
                font-black
                text-slate-950
              "
            >
              {status
                ? "Tidak ada permintaan dengan status ini"
                : "Belum ada permintaan"}
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-slate-500
              "
            >
              {status
                ? "Coba pilih status lain untuk melihat permintaan yang tersedia."
                : "Permintaan baru dari pelanggan akan muncul di halaman ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(
              (request) => (
                <Link
                  key={request.id}
                  href={`/service-requests/${encodeURIComponent(
                    request.id,
                  )}`}
                  className="
                    group
                    block
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    transition
                    hover:border-indigo-200
                    hover:shadow-[0_10px_35px_rgba(15,23,42,0.07)]
                  "
                >
                  <div className="p-5">
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <span
                        className={`
                          inline-flex
                          rounded-lg
                          border
                          px-2.5
                          py-1.5
                          text-[10px]
                          font-black

                          ${getStatusTone(
                            request.status,
                          )}
                        `}
                      >
                        {getServiceRequestStatusLabel(
                          request.status,
                        )}
                      </span>

                      <div className="text-right">
                        <p
                          className="
                            text-[10px]
                            font-medium
                            text-slate-400
                          "
                        >
                          Anggaran
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-sm
                            font-black
                            text-slate-950
                          "
                        >
                          {formatServiceRequestBudget(
                            request.budget,
                          )}
                        </p>
                      </div>
                    </div>

                    <h2
                      className="
                        mt-4
                        text-base
                        font-black
                        leading-6
                        text-slate-950
                        sm:text-lg
                      "
                    >
                      {request.listingTitle}
                    </h2>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        font-semibold
                        text-indigo-600
                      "
                    >
                      {request.listingCategory}
                    </p>

                    <p
                      className="
                        mt-3
                        line-clamp-2
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      {request.requestDescription}
                    </p>

                    <div
                      className="
                        mt-5
                        grid
                        gap-2.5
                        text-xs
                        text-slate-500
                        sm:grid-cols-2
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            text-slate-500
                          "
                        >
                          <UserRound
                            size={14}
                            strokeWidth={2}
                          />
                        </span>

                        <span className="min-w-0">
                          <span
                            className="
                              block
                              text-[9px]
                              font-medium
                              text-slate-400
                            "
                          >
                            Pelanggan
                          </span>

                          <span
                            className="
                              block
                              truncate
                              font-semibold
                              text-slate-700
                            "
                          >
                            {getCustomerLabel(
                              request,
                            )}
                          </span>
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            text-slate-500
                          "
                        >
                          {request.serviceMode ===
                          "ONLINE" ? (
                            <Globe2
                              size={14}
                              strokeWidth={2}
                            />
                          ) : (
                            <MapPin
                              size={14}
                              strokeWidth={2}
                            />
                          )}
                        </span>

                        <span>
                          <span
                            className="
                              block
                              text-[9px]
                              font-medium
                              text-slate-400
                            "
                          >
                            Cara layanan
                          </span>

                          <span
                            className="
                              block
                              font-semibold
                              text-slate-700
                            "
                          >
                            {getServiceRequestModeLabel(
                              request.serviceMode,
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        gap-2.5
                        rounded-xl
                        bg-slate-50
                        px-3
                        py-2.5
                      "
                    >
                      <Clock3
                        size={15}
                        strokeWidth={2}
                        className="
                          shrink-0
                          text-slate-400
                        "
                      />

                      <p
                        className="
                          text-[11px]
                          text-slate-500
                        "
                      >
                        Dibutuhkan{" "}
                        <span
                          className="
                            font-semibold
                            text-slate-700
                          "
                        >
                          {formatServiceRequestDateTime(
                            request.neededAt,
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      border-slate-100
                      px-5
                      py-3.5
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-bold
                        text-slate-600
                        transition
                        group-hover:text-indigo-700
                      "
                    >
                      Lihat detail permintaan
                    </span>

                    <ChevronRight
                      size={17}
                      strokeWidth={2}
                      className="
                        text-slate-400
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-indigo-600
                      "
                    />
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </section>

      {totalCount > 0 && (
        <div
          className="
            mt-6
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
            onClick={onPreviousPage}
            disabled={
              loading ||
              page <= 1
            }
            aria-label="Halaman sebelumnya"
            className="
              inline-flex
              h-10
              items-center
              gap-1.5
              rounded-xl
              px-3
              text-xs
              font-bold
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ChevronLeft
              size={16}
              strokeWidth={2}
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
              text-xs
              text-slate-500
            "
          >
            Halaman{" "}
            <span
              className="
                font-black
                text-slate-900
              "
            >
              {page}
            </span>
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
              h-10
              items-center
              gap-1.5
              rounded-xl
              px-3
              text-xs
              font-bold
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-30
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
              size={16}
              strokeWidth={2}
            />
          </button>
        </div>
      )}
    </div>
  </main>
);
}
