import Link from "next/link";

import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Globe2,
  MapPin,
  RefreshCw,
  Star,
} from "lucide-react";

import { ServiceMode } from "./constants/service-mode";

import type { ProviderServiceListingMedia } from "./types/service-listing-media.types";

import type { PublicServiceListingDetail } from "./types/service-listing-read.types";

interface ServiceListingDetailPageUIProps {
  listing: PublicServiceListingDetail | null;

  cover: ProviderServiceListingMedia | null;

  portfolio: ProviderServiceListingMedia[];

  loading: boolean;

  notFound: boolean;

  errorMessage: string | null;

  refresh: () => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(timestamp);
}

function getModeLabel(mode: PublicServiceListingDetail["serviceMode"]): string {
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

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-10 w-40 rounded-xl bg-slate-200" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="aspect-video rounded-[28px] bg-slate-200" />

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="h-5 w-28 rounded bg-slate-200" />

              <div className="mt-5 h-8 w-3/4 rounded bg-slate-200" />

              <div className="mt-4 h-5 w-52 rounded bg-slate-200" />

              <div className="mt-8 h-20 rounded-2xl bg-slate-100" />
            </div>

            <div className="h-40 rounded-[28px] bg-white" />

            <div className="h-40 rounded-[28px] bg-white" />
          </div>

          <div className="h-80 rounded-[28px] bg-white" />
        </div>
      </div>
    </main>
  );
}

function DetailNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <BriefcaseBusiness size={26} strokeWidth={1.8} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-950">
          Jasa tidak ditemukan
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Jasa ini mungkin sudah tidak aktif, kedaluwarsa, diblokir, atau tidak
          tersedia untuk publik.
        </p>

        <Link
          href="/services"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={17} strokeWidth={2} />
          Kembali ke Cari Jasa
        </Link>
      </div>
    </main>
  );
}

function DetailError({
  errorMessage,
  refresh,
}: {
  errorMessage: string;
  refresh: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">
          Detail jasa belum dapat dimuat
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">{errorMessage}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={17} strokeWidth={2} />
            Coba lagi
          </button>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} strokeWidth={2} />
            Cari jasa lain
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ServiceListingDetailPageUI({
  listing,
  cover,
  portfolio,
  loading,
  notFound,
  errorMessage,
  refresh,
}: ServiceListingDetailPageUIProps) {
  if (loading) {
    return <DetailSkeleton />;
  }

  if (notFound) {
    return <DetailNotFound />;
  }

  if (errorMessage) {
    return <DetailError errorMessage={errorMessage} refresh={refresh} />;
  }

  if (!listing) {
    return (
      <DetailError errorMessage="Data jasa tidak tersedia." refresh={refresh} />
    );
  }

  const providerName =
    listing.provider.fullName?.trim() ||
    listing.provider.username?.trim() ||
    "Provider HelpMe";

  const providerUsername = listing.provider.username?.trim() ?? "";

  const providerInitial = providerName.charAt(0).toUpperCase() || "H";

  const providerRating = listing.provider.rating;

  const providerTotalReviews = listing.provider.totalReviews ?? 0;

  const providerVerified = listing.provider.verificationStatus === "VERIFIED";

  const showLocation =
    listing.serviceMode !== ServiceMode.ONLINE &&
    Boolean(listing.locationName?.trim());

  return (
    <main className="min-h-screen bg-slate-50/70 pb-12">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Kembali ke Cari Jasa
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
              {cover ? (
                <div
                  role="img"
                  aria-label={`Cover ${listing.title}`}
                  style={{
                    backgroundImage: getBackgroundImage(cover.publicUrl),
                  }}
                  className="aspect-video w-full bg-slate-100 bg-cover bg-center"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-100 px-6 text-center">
                  <BriefcaseBusiness
                    size={38}
                    strokeWidth={1.5}
                    className="text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    HelpMe Jasa
                  </p>
                </div>
              )}

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                    {listing.category}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {getModeLabel(listing.serviceMode)}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {listing.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Mulai dari
                    </p>

                    <p className="mt-1 text-2xl font-bold text-indigo-700">
                      {formatPrice(listing.priceFrom)}
                    </p>

                    {listing.isNegotiable && (
                      <p className="mt-1 text-xs font-semibold text-emerald-600">
                        Harga dapat dinegosiasikan
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Globe2 size={16} strokeWidth={2} />

                      {getModeLabel(listing.serviceMode)}
                    </span>

                    {showLocation && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={16} strokeWidth={2} />

                        {listing.locationName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">Tentang jasa</h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {listing.description}
              </p>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">
                Yang akan Anda dapatkan
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {listing.deliverables}
              </p>
            </section>

            {listing.customerPreparation && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Yang perlu disiapkan
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {listing.customerPreparation}
                </p>
              </section>
            )}

            {portfolio.length > 0 && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Portfolio
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Contoh hasil atau dokumentasi jasa dari Provider.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {portfolio.map((image) => (
                    <div
                      key={image.id}
                      role="img"
                      aria-label={`Portfolio jasa ${image.sortOrder + 1}`}
                      style={{
                        backgroundImage: getBackgroundImage(image.publicUrl),
                      }}
                      className="aspect-square rounded-2xl bg-slate-100 bg-cover bg-center"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Provider
              </p>

              <div className="mt-4 flex items-center gap-3">
                {listing.provider.avatarUrl ? (
                  <div
                    role="img"
                    aria-label={`Foto ${providerName}`}
                    style={{
                      backgroundImage: getBackgroundImage(
                        listing.provider.avatarUrl,
                      ),
                    }}
                    className="h-14 w-14 shrink-0 rounded-full bg-slate-100 bg-cover bg-center"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                    {providerInitial}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-bold text-slate-950">
                      {providerName}
                    </p>

                    {providerVerified && (
                      <BadgeCheck
                        size={18}
                        strokeWidth={2}
                        className="shrink-0 text-indigo-600"
                        aria-label="Provider terverifikasi"
                      />
                    )}
                  </div>

                  {providerUsername && (
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      @{providerUsername}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <Star size={18} strokeWidth={2} className="text-amber-500" />

                {typeof providerRating === "number" ? (
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-950">
                      {providerRating.toFixed(1)}
                    </span>{" "}
                    · {providerTotalReviews} review
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">Belum ada rating</p>
                )}
              </div>

              {providerVerified && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <BadgeCheck size={16} strokeWidth={2} />
                  Identitas Provider terverifikasi
                </p>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <Link
                href={`/services/${encodeURIComponent(listing.id)}/request`}
                className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Minta Jasa
              </Link>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Jelaskan kebutuhan Anda kepada Provider. Kesepakatan dan
                pembayaran tidak dibuat otomatis.
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <CalendarDays
                    size={16}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0"
                  />
                  Jasa aktif sampai {formatDateTime(listing.expiresAt)}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
