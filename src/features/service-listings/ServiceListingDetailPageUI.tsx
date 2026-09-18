import Link from "next/link";

import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Globe2,
  Images,
  Info,
  MapPin,
  PackageCheck,
  RefreshCw,
  Star,
  UserRound,
} from "lucide-react";

import { ServiceMode } from "./constants/service-mode";

import type { ProviderServiceListingMedia } from "./types/service-listing-media.types";

import ServiceListingReportAction from "./components/ServiceListingReportAction";

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

function formatDate(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
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
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-5
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          animate-pulse
        "
      >
        <div
          className="
            h-9
            w-32
            rounded-xl
            bg-slate-200
          "
        />

        <div
          className="
            mt-5
            grid
            gap-6
            lg:grid-cols-[minmax(0,1fr)_360px]
          "
        >
          <div className="space-y-5">
            <div
              className="
                aspect-video
                rounded-2xl
                bg-slate-200
              "
            />

            <div
              className="
                h-52
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            />

            <div
              className="
                h-72
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            />
          </div>

          <div className="space-y-4">
            <div
              className="
                h-64
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            />

            <div
              className="
                h-52
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            />
          </div>
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
    <main
      className="
      min-h-screen
      bg-slate-50
      pb-28
      lg:pb-14
    "
    >
      <div
        className="
        mx-auto
        max-w-7xl
        px-4
        py-5
        sm:px-6
        sm:py-7
        lg:px-8
      "
      >
        {/* BACK */}
        <div
          className="
          flex
          items-center
          gap-3
        "
        >
          <Link
            href="/services"
            aria-label="Kembali ke Cari Jasa"
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
            text-slate-600
            transition
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-950
            active:scale-95
          "
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </Link>

          <div>
            <p
              className="
              text-sm
              font-black
              text-slate-950
            "
            >
              Detail Jasa
            </p>
          </div>
        </div>

        <div
          className="
          mt-5
          grid
          gap-6
          lg:grid-cols-[minmax(0,1fr)_360px]
          lg:items-start
        "
        >
          {/* MAIN CONTENT */}
          <div
            className="
            min-w-0
            space-y-5
          "
          >
            {/* HERO */}
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
                  aria-label={`Cover ${listing.title}`}
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
                  w-full
                  flex-col
                  items-center
                  justify-center
                  bg-slate-100
                  px-6
                  text-center
                "
                >
                  <BriefcaseBusiness
                    aria-hidden="true"
                    className="
                    h-9
                    w-9
                    text-slate-400
                  "
                    strokeWidth={1.5}
                  />

                  <p
                    className="
                    mt-3
                    text-sm
                    font-bold
                    text-slate-500
                  "
                  >
                    HelpMe Jasa
                  </p>
                </div>
              )}

              <div className="p-5 sm:p-6">
                {/* CATEGORY + MODE */}
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
                    inline-flex
                    items-center
                    rounded-lg
                    bg-indigo-50
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-bold
                    text-indigo-700
                  "
                  >
                    {listing.category}
                  </span>

                  <span
                    className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    bg-slate-100
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                  >
                    <Globe2 aria-hidden="true" className="h-3 w-3" />

                    {getModeLabel(listing.serviceMode)}
                  </span>
                </div>

                {/* TITLE */}
                <h1
                  className="
                  mt-4
                  text-base
                  font-black
                  leading-tight
                  tracking-tight
                  text-slate-950
                  sm:text-3xl
                "
                >
                  {listing.title}
                </h1>

                {/* PROVIDER SUMMARY */}
                <div
                  className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-2
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
                    {listing.provider.avatarUrl ? (
                      <div
                        role="img"
                        aria-label={`Foto ${providerName}`}
                        style={{
                          backgroundImage: getBackgroundImage(
                            listing.provider.avatarUrl,
                          ),
                        }}
                        className="
                        h-9
                        w-9
                        shrink-0
                        rounded-full
                        bg-slate-100
                        bg-cover
                        bg-center
                      "
                      />
                    ) : (
                      <div
                        className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-900
                        text-xs
                        font-black
                        text-white
                      "
                      >
                        {providerInitial}
                      </div>
                    )}

                    <div
                      className="
                      flex
                      min-w-0
                      items-center
                      gap-1
                    "
                    >
                      <span
                        className="
                        truncate
                        text-xs
                        font-bold
                        text-slate-700
                        sm:text-sm
                      "
                      >
                        {providerName}
                      </span>

                      {providerVerified && (
                        <BadgeCheck
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
                  </div>

                  {typeof providerRating === "number" && (
                    <>
                      <span
                        aria-hidden="true"
                        className="
                        hidden
                        text-slate-300
                        sm:inline
                      "
                      >
                        ·
                      </span>

                      <span
                        className="
                        inline-flex
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
                          fill-amber-400
                          text-amber-400
                        "
                        />

                        <strong
                          className="
                          font-bold
                          text-slate-700
                        "
                        >
                          {providerRating.toFixed(1)}
                        </strong>

                        <span>· {providerTotalReviews} ulasan</span>
                      </span>
                    </>
                  )}

                  {showLocation && (
                    <>
                      <span
                        aria-hidden="true"
                        className="
                        hidden
                        text-slate-300
                        sm:inline
                      "
                      >
                        ·
                      </span>

                      <span
                        className="
                        inline-flex
                        min-w-0
                        items-center
                        gap-1
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

                        <span className="truncate">{listing.locationName}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* MOBILE PRICE */}
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
                  lg:hidden
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
                      text-xl
                      font-black
                      tracking-tight
                      text-indigo-700
                    "
                    >
                      {formatPrice(listing.priceFrom)}
                    </p>
                  </div>

                  {listing.isNegotiable && (
                    <span
                      className="
                      rounded-lg
                      bg-emerald-50
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-bold
                      text-emerald-700
                    "
                    >
                      Bisa nego
                    </span>
                  )}
                </div>
              </div>
            </article>

            {/* SERVICE INFORMATION */}
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
      h-6.5
      w-6.5
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                  >
                    <Info
                      aria-hidden="true"
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  </span>

                  <h2
                    className="
      text-[12px]
      font-black
      tracking-tight
      text-slate-950
    "
                  >
                    Tentang jasa
                  </h2>
                </div>

                <p
                  className="
                  mt-2
                  whitespace-pre-line
                  text-sm
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
      h-6.5
      w-6.5
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                  >
                    <PackageCheck
                      aria-hidden="true"
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  </span>

                  <h2
                    className="
      text-[12px]
      font-black
      text-slate-950
    "
                  >
                    Yang kamu dapatkan
                  </h2>
                </div>

                <p
                  className="
                  mt-2
                  whitespace-pre-line
                  text-sm
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
      h-6.5
      w-6.5
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                    >
                      <ClipboardCheck
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </span>

                    <h2
                      className="
      text-[12px]
      font-black
      text-slate-950
    "
                    >
                      Yang perlu disiapkan
                    </h2>
                  </div>

                  <p
                    className="
                    mt-2
                    whitespace-pre-line
                    text-sm
                    leading-5
                    text-slate-600
                  "
                  >
                    {listing.customerPreparation}
                  </p>
                </div>
              )}
            </section>

            {/* PORTFOLIO */}
            {portfolio.length > 0 && (
              <section
                className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                sm:p-6
              "
              >
                <div>
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
      h-6.5
      w-6.5
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                    >
                      <Images
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </span>

                    <h2
                      className="
      text-[12px]
      font-black
      tracking-tight
      text-slate-950
    "
                    >
                      Portfolio
                    </h2>
                  </div>

                  <p
                    className="
                    mt-1
                    text-[12px]
                    leading-5
                    text-slate-500
                    sm:text-sm
                  "
                  >
                    Contoh hasil atau dokumentasi dari provider.
                  </p>
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
                        rounded-xl
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

          {/* DESKTOP SIDEBAR */}
          <aside
            className="
            space-y-4
            lg:sticky
            lg:top-6
          "
          >
            {/* ACTION CARD */}
            <section
              className="
              hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              lg:block
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
                Mulai dari
              </p>

              <div
                className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-2
              "
              >
                <p
                  className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-indigo-700
                "
                >
                  {formatPrice(listing.priceFrom)}
                </p>

                {listing.isNegotiable && (
                  <span
                    className="
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

              <Link
                href={`/services/${encodeURIComponent(listing.id)}/request`}
                className="
                mt-5
                flex
                min-h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-black
                text-white
                transition
                hover:bg-indigo-700
                active:scale-[0.99]
              "
              >
                Minta Jasa
              </Link>

              <p
                className="
                mt-3
                text-center
                text-[11px]
                leading-5
                text-slate-500
              "
              >
                Jelaskan kebutuhanmu kepada provider sebelum membuat
                kesepakatan.
              </p>

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
                  flex
                  items-start
                  gap-2
                  text-xs
                  leading-5
                  text-slate-500
                "
                >
                  <CalendarDays
                    aria-hidden="true"
                    className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                  />
                  Jasa aktif sampai {formatDate(listing.expiresAt)}
                </p>
              </div>

              <ServiceListingReportAction
                serviceListingId={listing.id}
                serviceTitle={listing.title}
              />
            </section>

            {/* PROVIDER */}
            <section
              className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            "
            >
              <div
                className="
    flex
    items-center
    gap-2.5
  "
              >
                <span
                  className="
      inline-flex
      h-6.5
      w-6.5
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-indigo-50
      text-indigo-600
    "
                >
                  <UserRound
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                </span>

                <p
                  className="
      text-[12px]
      font-black
      text-slate-950
    "
                >
                  Penyedia Jasa
                </p>
              </div>

              <div
                className="
                mt-4
                flex
                items-center
                gap-3
              "
              >
                {listing.provider.avatarUrl ? (
                  <div
                    role="img"
                    aria-label={`Foto ${providerName}`}
                    style={{
                      backgroundImage: getBackgroundImage(
                        listing.provider.avatarUrl,
                      ),
                    }}
                    className="
                    h-12
                    w-12
                    shrink-0
                    rounded-full
                    bg-slate-100
                    bg-cover
                    bg-center
                  "
                  />
                ) : (
                  <div
                    className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-900
                    text-sm
                    font-black
                    text-white
                  "
                  >
                    {providerInitial}
                  </div>
                )}

                <div className="min-w-0">
                  <div
                    className="
                    flex
                    items-center
                    gap-1.5
                  "
                  >
                    <p
                      className="
                      truncate
                      font-black
                      text-slate-950
                    "
                    >
                      {providerName}
                    </p>

                    {providerVerified && (
                      <BadgeCheck
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

                  {providerUsername && (
                    <p
                      className="
                      mt-0.5
                      truncate
                      text-xs
                      text-slate-500
                    "
                    >
                      @{providerUsername}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="
                mt-4
                flex
                items-center
                gap-2
                border-t
                border-slate-100
                pt-4
              "
              >
                <Star
                  aria-hidden="true"
                  className="
                  h-4
                  w-4
                  fill-amber-400
                  text-amber-400
                "
                />

                {typeof providerRating === "number" ? (
                  <p
                    className="
                    text-xs
                    text-slate-600
                  "
                  >
                    <strong
                      className="
                      font-black
                      text-slate-900
                    "
                    >
                      {providerRating.toFixed(1)}
                    </strong>
                    {" · "}
                    {providerTotalReviews} ulasan
                  </p>
                ) : (
                  <p
                    className="
                    text-xs
                    text-slate-500
                  "
                  >
                    Belum ada rating
                  </p>
                )}
              </div>

              {providerVerified && (
                <p
                  className="
                  mt-4
                  inline-flex
                  items-center
                  gap-1.5
                  text-[11px]
                  font-bold
                  text-emerald-700
                "
                >
                  <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                  Identitas terverifikasi
                </p>
              )}

              {/* MOBILE META */}
              <div
                className="
                mt-5
                border-t
                border-slate-100
                pt-4
                lg:hidden
              "
              >
                <p
                  className="
                  flex
                  items-start
                  gap-2
                  text-xs
                  leading-5
                  text-slate-500
                "
                >
                  <CalendarDays
                    aria-hidden="true"
                    className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                  />
                  Jasa aktif sampai {formatDate(listing.expiresAt)}
                </p>

                <ServiceListingReportAction
                  serviceListingId={listing.id}
                  serviceTitle={listing.title}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY CTA */}
      <div
        className="
        fixed
        inset-x-0
        bottom-0
        z-40
        border-t
        border-slate-200
        bg-white/95
        px-4
        py-3
        backdrop-blur-xl
        lg:hidden
      "
      >
        <div
          className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          gap-4
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

            <p
              className="
              truncate
              text-base
              font-black
              tracking-tight
              text-indigo-700
            "
            >
              {formatPrice(listing.priceFrom)}
            </p>
          </div>

          <Link
            href={`/services/${encodeURIComponent(listing.id)}/request`}
            className="
            inline-flex
            min-h-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-indigo-600
            px-6
            text-sm
            font-black
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
            active:scale-[0.98]
          "
          >
            Minta Jasa
          </Link>
        </div>
      </div>
    </main>
  );
}