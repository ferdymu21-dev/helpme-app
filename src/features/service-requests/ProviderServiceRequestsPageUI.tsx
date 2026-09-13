import Link from "next/link";

import {
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

function parseStatusFilter(value: string): ServiceRequestStatusValue | null {
  if (value === "ALL") {
    return null;
  }

  return SERVICE_REQUEST_STATUSES.find((status) => status === value) ?? null;
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

function RequestSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-[24px] border border-slate-200 bg-white"
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
    <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              Provider
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Permintaan Jasa
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Lihat permintaan dari Customer untuk jasa yang Anda tawarkan.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="service-request-status"
              className="text-xs font-semibold text-slate-500"
            >
              Filter status
            </label>

            <select
              id="service-request-status"
              value={status ?? "ALL"}
              onChange={(event) =>
                onStatusChange(parseStatusFilter(event.target.value))
              }
              disabled={loading}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            >
              <option value="ALL">Semua Status</option>

              {SERVICE_REQUEST_STATUSES.map((requestStatus) => (
                <option key={requestStatus} value={requestStatus}>
                  {getServiceRequestStatusLabel(requestStatus)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-950">{totalCount}</span>{" "}
            permintaan
          </p>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : undefined}
            />
            Muat ulang
          </button>
        </div>

        <section className="mt-5">
          {loading && items.length === 0 ? (
            <RequestSkeleton />
          ) : errorMessage ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-7 text-center shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Permintaan belum dapat dimuat
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={refresh}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Coba lagi
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Inbox size={26} strokeWidth={1.8} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Belum ada permintaan
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Permintaan dari Customer akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((request) => (
                <Link
                  key={request.id}
                  href={`/service-requests/${encodeURIComponent(request.id)}`}
                  className="block rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {getServiceRequestStatusLabel(request.status)}
                      </span>

                      <h2 className="mt-3 text-lg font-bold text-slate-950">
                        {request.listingTitle}
                      </h2>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {request.listingCategory}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-950">
                      {formatServiceRequestBudget(request.budget)}
                    </p>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {request.requestDescription}
                  </p>

                  <div className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <UserRound size={15} />
                      {getCustomerLabel(request)}
                    </p>

                    <p className="flex items-center gap-2">
                      {request.serviceMode === "ONLINE" ? (
                        <Globe2 size={15} />
                      ) : (
                        <MapPin size={15} />
                      )}

                      {getServiceRequestModeLabel(request.serviceMode)}
                    </p>

                    <p className="flex items-center gap-2 sm:col-span-2">
                      <Clock3 size={15} />
                      Dibutuhkan{" "}
                      {formatServiceRequestDateTime(request.neededAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {totalCount > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Sebelumnya
            </button>

            <p className="text-sm text-slate-500">
              Halaman <span className="font-bold text-slate-950">{page}</span>{" "}
              dari{" "}
              <span className="font-bold text-slate-950">{totalPages}</span>
            </p>

            <button
              type="button"
              onClick={onNextPage}
              disabled={loading || page >= totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
