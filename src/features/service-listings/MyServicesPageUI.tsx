import Link from "next/link";

import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  ImageIcon,
  MapPin,
  Plus,
  RefreshCw,
  Settings2,
} from "lucide-react";

import { ServiceListingStatus } from "./constants/service-listing-status";

import { ServiceMode } from "./constants/service-mode";

import type { ProviderServiceListing } from "./types/service-listing-read.types";

import { getServiceListingMediaPublicUrl } from "./utils/service-listing-media-url";

interface MyServicesPageUIProps {
  items: ProviderServiceListing[];

  totalCount: number;

  page: number;

  totalPages: number;

  loading: boolean;

  errorMessage: string | null;

  refresh: () => void;

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

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
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

function getStatusClassName(status: ProviderServiceListing["status"]): string {
  switch (status) {
    case ServiceListingStatus.DRAFT:
      return "bg-slate-100 text-slate-700";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "bg-amber-100 text-amber-800";

    case ServiceListingStatus.ACTIVE:
      return "bg-emerald-100 text-emerald-800";

    case ServiceListingStatus.PAUSED:
      return "bg-indigo-100 text-indigo-800";

    case ServiceListingStatus.EXPIRED:
      return "bg-orange-100 text-orange-800";

    case ServiceListingStatus.BLOCKED:
      return "bg-red-100 text-red-700";

    case ServiceListingStatus.ARCHIVED:
      return "bg-slate-200 text-slate-700";
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

function getLifecycleContext(listing: ProviderServiceListing): string | null {
  switch (listing.status) {
    case ServiceListingStatus.DRAFT:
      return "Belum dipublikasikan";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Menunggu penyelesaian publikasi";

    case ServiceListingStatus.ACTIVE: {
      const expiresAt = formatDateTime(listing.expiresAt);

      return expiresAt ? `Aktif sampai ${expiresAt}` : "Jasa sedang aktif";
    }

    case ServiceListingStatus.PAUSED: {
      const expiresAt = formatDateTime(listing.expiresAt);

      return expiresAt
        ? `Dijeda · masa aktif sampai ${expiresAt}`
        : "Publikasi sedang dijeda";
    }

    case ServiceListingStatus.EXPIRED: {
      const expiresAt = formatDateTime(listing.expiresAt);

      return expiresAt
        ? `Masa aktif berakhir ${expiresAt}`
        : "Masa aktif telah berakhir";
    }

    case ServiceListingStatus.BLOCKED:
      return listing.blockedReason
        ? `Diblokir: ${listing.blockedReason}`
        : "Diblokir oleh HelpMe";

    case ServiceListingStatus.ARCHIVED: {
      const archivedAt = formatDateTime(listing.archivedAt);

      return archivedAt ? `Diarsipkan ${archivedAt}` : "Jasa telah diarsipkan";
    }
  }
}

function ServiceListingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-[26px] border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export default function MyServicesPageUI({
  items,
  totalCount,
  page,
  totalPages,
  loading,
  errorMessage,
  refresh,
  onPreviousPage,
  onNextPage,
}: MyServicesPageUIProps) {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              Provider
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Jasa Saya
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Kelola jasa yang Anda tawarkan dan lihat status publikasinya.
            </p>
          </div>

          <Link
            href="/my-services/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={18} />
            Tawarkan Jasa
          </Link>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-950">{totalCount}</span> jasa
          </p>

          {loading && items.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <RefreshCw size={14} className="animate-spin" />
              Memperbarui
            </div>
          )}
        </div>

        {errorMessage && (
          <section className="mt-5 rounded-[24px] border border-red-200 bg-white p-6">
            <p className="font-bold text-slate-950">
              Jasa Anda belum dapat dimuat
            </p>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : undefined}
              />
              Coba Lagi
            </button>
          </section>
        )}

        {!errorMessage && loading && items.length === 0 && (
          <div className="mt-5">
            <ServiceListingSkeleton />
          </div>
        )}

        {!errorMessage && !loading && items.length === 0 && (
          <section className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BriefcaseBusiness size={26} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Belum ada jasa
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Mulai tawarkan kemampuan Anda agar Customer dapat menemukan dan
              mengajukan Permintaan Jasa.
            </p>

            <Link
              href="/my-services/new"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Tawarkan Jasa
            </Link>
          </section>
        )}

        {!errorMessage && items.length > 0 && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {items.map((listing) => {
              const coverUrl = getServiceListingMediaPublicUrl(
                listing.coverStoragePath,
              );

              const lifecycleContext = getLifecycleContext(listing);

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[16/8] bg-slate-100">
                    {coverUrl ? (
                      <div
                        role="img"
                        aria-label={`Cover ${listing.title}`}
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${JSON.stringify(coverUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon size={32} />
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClassName(
                        listing.status,
                      )}`}
                    >
                      {getStatusLabel(listing.status)}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-indigo-600">
                      {listing.category}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-lg font-bold text-slate-950">
                      {listing.title}
                    </h2>

                    <p className="mt-3 text-base font-bold text-slate-950">
                      Mulai {formatPrice(listing.priceFrom)}
                      {listing.isNegotiable && (
                        <span className="ml-2 text-xs font-semibold text-emerald-700">
                          Bisa dinegosiasikan
                        </span>
                      )}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                        <Globe2 size={14} />
                        {getModeLabel(listing.serviceMode)}
                      </span>

                      {listing.locationName && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                          <MapPin size={14} />
                          {listing.locationName}
                        </span>
                      )}
                    </div>

                    {lifecycleContext && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                        <Clock3 size={15} className="mt-0.5 shrink-0" />

                        <span>{lifecycleContext}</span>
                      </div>
                    )}

                    <Link
                      href={`/my-services/${listing.id}/preview`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                    >
                      <Settings2 size={17} />
                      Kelola Jasa
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!errorMessage && items.length > 0 && (totalPages > 1 || page > 1) && (
          <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={loading || page <= 1}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <ChevronLeft size={17} />
              Sebelumnya
            </button>

            <p className="text-sm text-slate-600">
              Halaman <span className="font-bold text-slate-950">{page}</span>{" "}
              dari{" "}
              <span className="font-bold text-slate-950">{totalPages}</span>
            </p>

            <button
              type="button"
              onClick={onNextPage}
              disabled={loading || page >= totalPages}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
