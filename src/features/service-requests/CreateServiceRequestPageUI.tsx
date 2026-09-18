import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Globe2,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { ServiceMode } from "@/features/service-listings/constants/service-mode";

import type { PublicServiceListingDetail } from "@/features/service-listings/types/service-listing-read.types";

import type { ServiceRequestMode } from "./types/service-request.types";

interface CreateServiceRequestPageUIProps {
  listing: PublicServiceListingDetail | null;

  loading: boolean;

  notFound: boolean;

  listingErrorMessage: string | null;

  submissionErrorMessage: string | null;

  refresh: () => void;

  requestDescription: string;

  neededAt: string;

  selectedMode: ServiceRequestMode | "";

  locationName: string;

  budget: string;

  submitting: boolean;

  createdRequestId: string | null;

  onRequestDescriptionChange: (value: string) => void;

  onNeededAtChange: (value: string) => void;

  onModeChange: (value: ServiceRequestMode) => void;

  onLocationNameChange: (value: string) => void;

  onBudgetChange: (value: string) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  onBack: () => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBudget(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    return "Belum diisi";
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    return normalized;
  }

  return formatPrice(amount);
}

function formatNeededAt(value: string): string {
  if (!value) {
    return "Belum dipilih";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export default function CreateServiceRequestPageUI({
  listing,
  loading,
  notFound,
  listingErrorMessage,
  submissionErrorMessage,
  refresh,
  requestDescription,
  neededAt,
  selectedMode,
  locationName,
  budget,
  submitting,
  createdRequestId,
  onRequestDescriptionChange,
  onNeededAtChange,
  onModeChange,
  onLocationNameChange,
  onBudgetChange,
  onSubmit,
  onBack,
}: CreateServiceRequestPageUIProps) {
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-2xl animate-pulse">
          <div className="h-10 w-40 rounded-xl bg-slate-200" />

          <div className="mt-6 h-130 rounded-[28px] bg-white" />
        </div>
      </main>
    );
  }

  if (listingErrorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Form belum dapat dimuat
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {listingErrorMessage}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Jasa tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Jasa ini mungkin sudah tidak aktif atau tidak lagi tersedia untuk
            menerima permintaan.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }
  if (createdRequestId) {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        px-4
        py-10
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          text-center
          shadow-sm
          sm:p-8
        "
      >
        <span
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-emerald-50
            text-emerald-600
          "
        >
          <CheckCircle2
            aria-hidden="true"
            className="h-7 w-7"
          />
        </span>

        <h1
          className="
            mt-5
            text-xl
            font-black
            text-slate-950
          "
        >
          Permintaan berhasil dikirim
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-600
          "
        >
          Permintaanmu sudah diteruskan
          kepada penyedia jasa dan sedang
          menunggu tanggapan.
        </p>

        <div
          className="
            mt-6
            rounded-xl
            bg-slate-50
            px-4
            py-3
            text-left
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
            Jasa
          </p>

          <p
            className="
              mt-1
              text-sm
              font-bold
              text-slate-800
            "
          >
            {listing.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="
            mt-6
            inline-flex
            min-h-11
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
          Kembali ke detail jasa
        </button>
      </div>
    </main>
  );
}

  const listingAllowsChoice = listing.serviceMode === ServiceMode.BOTH;

  const showLocation = selectedMode === ServiceMode.OFFLINE;

  return (
    <main
      className="
      min-h-screen
      bg-slate-50
      pb-10
    "
    >
      <div
        className="
        mx-auto
        w-full
        max-w-2xl
      "
      >
        {/* HEADER */}
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
            disabled={submitting}
            aria-label="Kembali ke detail jasa"
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
            disabled:opacity-50
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
              Buat Permintaan
            </h1>

            <p
              className="
              mt-0.5
              text-[11px]
              text-slate-500
            "
            >
              Jelaskan kebutuhanmu kepada penyedia
            </p>
          </div>
        </header>

        <div
          className="
          space-y-4
          px-4
          pt-5
          sm:px-6
          sm:pt-6
        "
        >
          {/* LISTING SUMMARY */}
          <section
            className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
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
                <span
                  className="
                  inline-flex
                  rounded-lg
                  bg-indigo-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  text-indigo-700
                "
                >
                  {listing.category}
                </span>

                <h2
                  className="
                  mt-3
                  text-base
                  font-black
                  leading-snug
                  text-slate-950
                "
                >
                  {listing.title}
                </h2>

                <p
                  className="
                  mt-2
                  text-[10px]
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
                  text-indigo-700
                "
                >
                  {formatPrice(listing.priceFrom)}
                </p>
              </div>

              {listing.isNegotiable && (
                <span
                  className="
                  shrink-0
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
          </section>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* DESCRIPTION */}
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
                items-start
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
                  <FileText aria-hidden="true" className="h-4 w-4" />
                </span>

                <div>
                  <label
                    htmlFor="request-description"
                    className="
                    text-[12px]
                    font-black
                    text-slate-950
                  "
                  >
                    Ceritakan kebutuhanmu
                  </label>

                  <p
                    className="
                    mt-0.5
                    text-xs
                    leading-5
                    text-slate-500
                  "
                  >
                    Jelaskan hasil yang kamu harapkan, kebutuhan khusus, atau
                    referensi yang perlu diketahui penyedia.
                  </p>
                </div>
              </div>

              <textarea
                id="request-description"
                value={requestDescription}
                onChange={(event) =>
                  onRequestDescriptionChange(event.target.value)
                }
                disabled={submitting}
                rows={5}
                placeholder="Contoh: Saya membutuhkan desain logo untuk usaha makanan dengan gaya sederhana dan modern..."
                className="
                mt-4
                w-full
                resize-y
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                leading-6
                text-slate-950
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-100
                disabled:bg-slate-50
              "
              />
            </section>

            {/* SCHEDULE */}
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
                gap-3
              "
              >
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
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                </span>

                <label
                  htmlFor="needed-at"
                  className="
                  text-[12px]
                  font-black
                  text-slate-950
                "
                >
                  Kapan dibutuhkan?
                </label>
              </div>

              <input
                id="needed-at"
                type="datetime-local"
                value={neededAt}
                onChange={(event) => onNeededAtChange(event.target.value)}
                disabled={submitting}
                className="
                mt-4
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-950
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-100
                disabled:bg-slate-50
              "
              />
            </section>

            {/* MODE */}
            <section
              className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            "
            >
              <p
                className="
                text-[12px]
                font-black
                text-slate-950
              "
              >
                Mode pengerjaan
              </p>

              <p
                className="
                mt-1
                text-[12px]
                text-slate-500
              "
              >
                Pilih cara pelaksanaan jasa.
              </p>

              {listingAllowsChoice ? (
                <div
                  className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                "
                >
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onModeChange(ServiceMode.ONLINE)}
                    className={`
                    flex
                    min-h-20
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-bold
                    transition
                    ${
                      selectedMode === ServiceMode.ONLINE
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }
                  `}
                  >
                    <Globe2 aria-hidden="true" className="mb-2 h-5 w-5" />
                    Online
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onModeChange(ServiceMode.OFFLINE)}
                    className={`
                    flex
                    min-h-20
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-bold
                    transition
                    ${
                      selectedMode === ServiceMode.OFFLINE
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }
                  `}
                  >
                    <MapPin aria-hidden="true" className="mb-2 h-5 w-5" />
                    Offline
                  </button>
                </div>
              ) : (
                <div
                  className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                "
                >
                  {selectedMode === ServiceMode.ONLINE ? (
                    <Globe2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                  )}

                  {selectedMode === ServiceMode.ONLINE ? "Online" : "Offline"}
                </div>
              )}

              {showLocation && (
                <div className="mt-4">
                  <label
                    htmlFor="location-name"
                    className="
                    text-xs
                    font-bold
                    text-slate-700
                  "
                  >
                    Lokasi pengerjaan
                  </label>

                  <input
                    id="location-name"
                    type="text"
                    value={locationName}
                    onChange={(event) =>
                      onLocationNameChange(event.target.value)
                    }
                    disabled={submitting}
                    placeholder="Contoh: Wonokromo, Surabaya"
                    className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    text-slate-950
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:bg-slate-50
                  "
                  />
                </div>
              )}
            </section>

            {/* BUDGET */}
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
                gap-3
              "
              >
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
                  <WalletCards aria-hidden="true" className="h-4 w-4" />
                </span>

                <div>
                  <label
                    htmlFor="budget"
                    className="
                    text-[12px]
                    font-black
                    text-slate-950
                  "
                  >
                    Anggaran
                  </label>

                  <p
                    className="
                    mt-0.5
                    text-[12px]
                    text-slate-500
                  "
                  >
                    Opsional. Masukkan anggaran yang kamu siapkan.
                  </p>
                </div>
              </div>

              <div
                className="
                mt-4
                flex
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                focus-within:border-indigo-500
                focus-within:ring-2
                focus-within:ring-indigo-100
              "
              >
                <span
                  className="
                  flex
                  items-center
                  bg-slate-50
                  px-4
                  text-sm
                  font-bold
                  text-slate-500
                "
                >
                  Rp
                </span>

                <input
                  id="budget"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(event) => onBudgetChange(event.target.value)}
                  disabled={submitting}
                  placeholder="Contoh: 150000"
                  className="
                  min-w-0
                  flex-1
                  px-4
                  py-3
                  text-sm
                  text-slate-950
                  outline-none
                  disabled:bg-slate-50
                "
                />
              </div>
            </section>

            {/* SUMMARY */}
            <section
              className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            "
            >
              <h2
                className="
                text-sm
                font-black
                text-slate-950
              "
              >
                Ringkasan permintaan
              </h2>

              <div
                className="
                mt-4
                divide-y
                divide-slate-100
                text-xs
              "
              >
                <div
                  className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  py-3
                "
                >
                  <span className="text-slate-500">Jasa</span>

                  <span
                    className="
                    max-w-[65%]
                    text-right
                    font-bold
                    text-slate-800
                  "
                  >
                    {listing.title}
                  </span>
                </div>

                <div
                  className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  py-3
                "
                >
                  <span className="text-slate-500">Mode</span>

                  <span
                    className="
                    font-bold
                    text-slate-800
                  "
                  >
                    {selectedMode === ServiceMode.ONLINE
                      ? "Online"
                      : selectedMode === ServiceMode.OFFLINE
                        ? "Offline"
                        : "Belum dipilih"}
                  </span>
                </div>

                {showLocation && (
                  <div
                    className="
      flex
      items-start
      justify-between
      gap-4
      py-3
    "
                  >
                    <span className="text-slate-500">Lokasi</span>

                    <span
                      className="
        max-w-[65%]
        text-right
        font-bold
        text-slate-800
      "
                    >
                      {locationName.trim() || "Belum diisi"}
                    </span>
                  </div>
                )}

                <div
                  className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  py-3
                "
                >
                  <span className="text-slate-500">Dibutuhkan</span>

                  <span
                    className="
                    text-right
                    font-bold
                    text-slate-800
                  "
                  >
                    {formatNeededAt(neededAt)}
                  </span>
                </div>

                <div
                  className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  py-3
                "
                >
                  <span className="text-slate-500">Anggaran</span>

                  <span
                    className="
                    font-bold
                    text-slate-800
                  "
                  >
                    {formatBudget(budget)}
                  </span>
                </div>
              </div>
            </section>

            {submissionErrorMessage && (
              <div
                role="alert"
                className="
                rounded-xl
                border
                border-rose-200
                bg-rose-50
                px-4
                py-3
                text-sm
                leading-6
                text-rose-700
              "
              >
                {submissionErrorMessage}
              </div>
            )}

            <section
              className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            "
            >
              <button
                type="submit"
                disabled={submitting}
                className="
                inline-flex
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
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              >
                {submitting ? "Mengirim..." : "Kirim Permintaan"}
              </button>

              <div
                className="
                mt-4
                flex
                items-start
                gap-2
                rounded-xl
                bg-slate-50
                px-3
                py-3
              "
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-500
                "
                />

                <p
                  className="
                  text-[11px]
                  leading-5
                  text-slate-500
                "
                >
                  Mengirim permintaan tidak melakukan pembayaran dan tidak
                  membuat kesepakatan otomatis.
                </p>
              </div>
            </section>
          </form>
        </div>
      </div>
    </main>
  );
}
