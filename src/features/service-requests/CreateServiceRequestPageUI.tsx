import { ArrowLeft, CheckCircle2, Globe2, MapPin } from "lucide-react";

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

          <div className="mt-6 h-[520px] rounded-[28px] bg-white" />
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-[28px] border border-emerald-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} strokeWidth={2} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Permintaan jasa terkirim
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Permintaan Anda sudah diteruskan kepada Provider dan sedang menunggu
            tanggapan.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
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
    <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 disabled:opacity-50"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Kembali ke detail jasa
        </button>

        <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
            Permintaan Jasa
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {listing.title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Jelaskan kebutuhan Anda agar Provider dapat menilai permintaan
            dengan jelas.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="request-description"
                className="text-sm font-semibold text-slate-800"
              >
                Kebutuhan Anda
              </label>

              <textarea
                id="request-description"
                value={requestDescription}
                onChange={(event) =>
                  onRequestDescriptionChange(event.target.value)
                }
                disabled={submitting}
                rows={5}
                placeholder="Contoh: Saya membutuhkan bantuan untuk..."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="needed-at"
                className="text-sm font-semibold text-slate-800"
              >
                Waktu dibutuhkan
              </label>

              <input
                id="needed-at"
                type="datetime-local"
                value={neededAt}
                onChange={(event) => onNeededAtChange(event.target.value)}
                disabled={submitting}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cara pelaksanaan
              </p>

              {listingAllowsChoice ? (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onModeChange(ServiceMode.ONLINE)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selectedMode === ServiceMode.ONLINE
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Globe2 size={18} className="mx-auto mb-1.5" />
                    Online
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onModeChange(ServiceMode.OFFLINE)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selectedMode === ServiceMode.OFFLINE
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <MapPin size={18} className="mx-auto mb-1.5" />
                    Offline
                  </button>
                </div>
              ) : (
                <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {selectedMode === ServiceMode.ONLINE ? "Online" : "Offline"}
                </div>
              )}
            </div>

            {showLocation && (
              <div>
                <label
                  htmlFor="location-name"
                  className="text-sm font-semibold text-slate-800"
                >
                  Lokasi
                </label>

                <input
                  id="location-name"
                  type="text"
                  value={locationName}
                  onChange={(event) => onLocationNameChange(event.target.value)}
                  disabled={submitting}
                  placeholder="Contoh: Wonokromo, Surabaya"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="budget"
                className="text-sm font-semibold text-slate-800"
              >
                Budget
                <span className="ml-1 font-normal text-slate-400">
                  (opsional)
                </span>
              </label>

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="flex items-center bg-slate-50 px-4 text-sm font-semibold text-slate-500">
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
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-950 outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {submissionErrorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {submissionErrorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Mengirim..." : "Kirim Permintaan"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Pengiriman permintaan tidak melakukan pembayaran atau membuat
              kesepakatan otomatis.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
