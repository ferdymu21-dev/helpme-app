import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";

import { ServiceRequestStatus } from "./constants/service-request-status";
import ServiceAgreementPanel from "./ServiceAgreementPanel";
import ServiceRequestChatAction from "./ServiceRequestChatAction";

import type { ServiceRequestDetail } from "./types/service-request-read.types";

import {
  formatServiceRequestBudget,
  formatServiceRequestDateTime,
  getServiceRequestModeLabel,
  getServiceRequestStatusLabel,
} from "./utils/service-request-display";

interface ServiceRequestDetailPageUIProps {
  detail: ServiceRequestDetail | null;

  loading: boolean;

  notFound: boolean;

  loadErrorMessage: string | null;

  actionErrorMessage: string | null;

  actionPending: boolean;

  isProvider: boolean;

  isCustomer: boolean;

  canBeginNegotiation: boolean;

  canStartWork: boolean;

  canSubmitWork: boolean;

  canRespondToCompletion: boolean;

  canDecline: boolean;

  canCancel: boolean;

  declineOpen: boolean;

  cancellationOpen: boolean;

  cancellationReason: string;

  submissionNote: string;

  revisionOpen: boolean;

  revisionReason: string;

  declineReason: string;

  refresh: () => void;

  onBeginNegotiation: () => void;

  onStartWork: () => void;

  onSubmitWork: () => void;

  onSubmissionNoteChange: (value: string) => void;

  onAcceptCompletion: () => void;

  onOpenRevision: () => void;

  onCancelRevision: () => void;

  onConfirmRevision: () => void;

  onRevisionReasonChange: (value: string) => void;

  onOpenDecline: () => void;

  onCancelDecline: () => void;

  onConfirmDecline: () => void;

  onDeclineReasonChange: (value: string) => void;

  onOpenCancellation: () => void;

  onCancelCancellation: () => void;

  onConfirmCancellation: () => void;

  onCancellationReasonChange: (value: string) => void;
}

function getPersonLabel(
  fullName: string | null,
  username: string | null,
  fallback: string,
): string {
  if (fullName) {
    return fullName;
  }

  if (username) {
    return `@${username}`;
  }

  return fallback;
}

export default function ServiceRequestDetailPageUI({
  detail,
  loading,
  notFound,
  loadErrorMessage,
  actionErrorMessage,
  actionPending,
  isProvider,
  isCustomer,
  canBeginNegotiation,
  canStartWork,
  canSubmitWork,
  canRespondToCompletion,
  canDecline,
  canCancel,
  declineOpen,
  declineReason,
  cancellationOpen,
  cancellationReason,
  submissionNote,
  revisionOpen,
  revisionReason,
  refresh,
  onBeginNegotiation,
  onStartWork,
  onSubmitWork,
  onSubmissionNoteChange,
  onAcceptCompletion,
  onOpenRevision,
  onCancelRevision,
  onConfirmRevision,
  onRevisionReasonChange,
  onOpenDecline,
  onCancelDecline,
  onConfirmDecline,
  onDeclineReasonChange,
  onOpenCancellation,
  onCancelCancellation,
  onConfirmCancellation,
  onCancellationReasonChange,
}: ServiceRequestDetailPageUIProps) {
  if (loading && !detail) {
    return (
      <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-10 w-40 rounded-xl bg-slate-200" />

          <div className="mt-6 h-72 rounded-[28px] bg-white" />

          <div className="mt-5 h-48 rounded-[28px] bg-white" />
        </div>
      </main>
    );
  }

  if (loadErrorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-[28px] border border-red-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Detail permintaan belum dapat dimuat
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {loadErrorMessage}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={17} />
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  if (notFound || !detail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Permintaan Jasa tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Permintaan ini tidak tersedia atau Anda bukan peserta transaksi
            tersebut.
          </p>

          <Link
            href="/service-requests/provider"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  const customerLabel = getPersonLabel(
    detail.customerFullName,
    detail.customerUsername,
    "Customer HelpMe",
  );

  const providerLabel = getPersonLabel(
    detail.providerFullName,
    detail.providerUsername,
    "Provider HelpMe",
  );

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={
            isProvider
              ? "/service-requests/provider"
              : `/services/${encodeURIComponent(detail.serviceListingId)}`
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {getServiceRequestStatusLabel(detail.status)}
                  </span>

                  <h1 className="mt-3 text-2xl font-bold text-slate-950">
                    {detail.listingTitle}
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {detail.listingCategory}
                  </p>
                </div>

                <p className="text-base font-bold text-slate-950">
                  {formatServiceRequestBudget(detail.budget)}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="text-sm font-bold text-slate-950">
                  Kebutuhan Customer
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {detail.requestDescription}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CalendarDays size={15} />
                    Dibutuhkan
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatServiceRequestDateTime(detail.neededAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    {detail.serviceMode === "ONLINE" ? (
                      <Globe2 size={15} />
                    ) : (
                      <MapPin size={15} />
                    )}
                    Pelaksanaan
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getServiceRequestModeLabel(detail.serviceMode)}
                  </p>
                </div>
              </div>

              {detail.locationName && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <MapPin size={15} />
                    Lokasi
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {detail.locationName}
                  </p>
                </div>
              )}
            </section>

            <ServiceAgreementPanel
              requestId={detail.id}
              requestStatus={detail.status}
              isProvider={isProvider}
              isCustomer={isCustomer}
              onRequestChanged={refresh}
            />

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-base font-bold text-slate-950">
                Pihak dalam Permintaan
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <UserRound size={15} />
                    Customer
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {customerLabel}
                  </p>

                  {detail.customerFullName && detail.customerUsername && (
                    <p className="mt-1 text-xs text-slate-500">
                      @{detail.customerUsername}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <UserRound size={15} />
                    Provider
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {providerLabel}
                  </p>

                  {detail.providerFullName && detail.providerUsername && (
                    <p className="mt-1 text-xs text-slate-500">
                      @{detail.providerUsername}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {(detail.status === ServiceRequestStatus.DECLINED ||
              detail.status === ServiceRequestStatus.CANCELLED) && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-base font-bold text-slate-950">
                  Informasi Penutupan
                </h2>

                {detail.status === ServiceRequestStatus.DECLINED && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-red-700">
                      <XCircle size={17} />
                      Permintaan ditolak
                    </p>

                    {detail.declinedReason && (
                      <p className="mt-2 text-sm leading-6 text-red-700">
                        {detail.declinedReason}
                      </p>
                    )}
                  </div>
                )}

                {detail.status === ServiceRequestStatus.CANCELLED && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      Permintaan dibatalkan
                    </p>

                    {detail.cancellationReason && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {detail.cancellationReason}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock3 size={15} />
                Dibuat
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatServiceRequestDateTime(detail.createdAt)}
              </p>
            </section>

            <ServiceRequestChatAction
              requestId={detail.id}
              requestStatus={detail.status}
              isProvider={isProvider}
              isCustomer={isCustomer}
            />
            {detail.latestCompletionSubmission && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Hasil Pekerjaan
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Pengiriman #{detail.latestCompletionSubmission.submissionNo}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {detail.latestCompletionSubmission.status ===
                    "SUBMITTED"
                      ? "Menunggu respons"
                      : detail.latestCompletionSubmission.status ===
                          "REVISION_REQUESTED"
                        ? "Revisi diminta"
                        : "Diterima"}
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold text-slate-500">
                  Catatan Provider
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {detail.latestCompletionSubmission.providerNote}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Dikirim{" "}
                  {formatServiceRequestDateTime(
                    detail.latestCompletionSubmission.submittedAt,
                  )}
                </p>

                {detail.latestCompletionSubmission.revisionReason && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-800">
                      Catatan Revisi
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                      {detail.latestCompletionSubmission.revisionReason}
                    </p>
                  </div>
                )}

                {isCustomer && canRespondToCompletion && (
                  <div className="mt-5">
                    {actionErrorMessage && (
                      <div
                        role="alert"
                        className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                      >
                        {actionErrorMessage}
                      </div>
                    )}

                    {!revisionOpen ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={onAcceptCompletion}
                          disabled={actionPending}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 size={17} />
                          {actionPending
                            ? "Memproses..."
                            : "Terima Hasil"}
                        </button>

                        <button
                          type="button"
                          onClick={onOpenRevision}
                          disabled={actionPending}
                          className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Minta Revisi
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label
                          htmlFor="completion-revision-reason"
                          className="block text-sm font-semibold text-slate-800"
                        >
                          Alasan revisi
                        </label>

                        <textarea
                          id="completion-revision-reason"
                          rows={4}
                          value={revisionReason}
                          onChange={(event) =>
                            onRevisionReasonChange(event.target.value)
                          }
                          disabled={actionPending}
                          placeholder="Jelaskan bagian yang perlu diperbaiki."
                          className="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={onCancelRevision}
                            disabled={actionPending}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Batal
                          </button>

                          <button
                            type="button"
                            onClick={onConfirmRevision}
                            disabled={actionPending}
                            className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionPending
                              ? "Mengirim..."
                              : "Kirim Revisi"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {isProvider && canSubmitWork && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">
                  Serahkan Hasil Pekerjaan
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Tulis ringkasan hasil pekerjaan yang akan diperiksa oleh
                  Customer.
                </p>

                <label
                  htmlFor="completion-submission-note"
                  className="mt-5 block text-sm font-semibold text-slate-800"
                >
                  Catatan hasil pekerjaan
                </label>

                <textarea
                  id="completion-submission-note"
                  rows={5}
                  value={submissionNote}
                  onChange={(event) =>
                    onSubmissionNoteChange(event.target.value)
                  }
                  disabled={actionPending}
                  placeholder="Contoh: Logo final sudah selesai sesuai warna cokelat dan krem yang disepakati."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

                {actionErrorMessage && (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {actionErrorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onSubmitWork}
                  disabled={actionPending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={17} />
                  {actionPending ? "Mengirim..." : "Kirim Hasil Pekerjaan"}
                </button>
              </section>
            )}

            {isProvider && canStartWork && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">
                  Mulai Pekerjaan
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kesepakatan telah disetujui. Mulai pekerjaan saat Anda
                  siap menjalankan pekerjaan sesuai kesepakatan.
                </p>

                {actionErrorMessage && (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {actionErrorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onStartWork}
                  disabled={actionPending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={17} />
                  {actionPending ? "Memproses..." : "Mulai Pekerjaan"}
                </button>
              </section>
            )}

            {isProvider && (canBeginNegotiation || canDecline) && (
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">
                  Tanggapi Permintaan
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Pilih tindakan sesuai kesiapan Anda menangani kebutuhan
                  Customer.
                </p>

                {actionErrorMessage && (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {actionErrorMessage}
                  </div>
                )}

                {!declineOpen ? (
                  <div className="mt-5 space-y-3">
                    {canBeginNegotiation && (
                      <button
                        type="button"
                        onClick={onBeginNegotiation}
                        disabled={actionPending}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={17} />
                        {actionPending ? "Memproses..." : "Mulai Negosiasi"}
                      </button>
                    )}

                    {canDecline && (
                      <button
                        type="button"
                        onClick={onOpenDecline}
                        disabled={actionPending}
                        className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Tolak Permintaan
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5">
                    <label
                      htmlFor="decline-reason"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Alasan penolakan
                    </label>

                    <textarea
                      id="decline-reason"
                      rows={4}
                      value={declineReason}
                      onChange={(event) =>
                        onDeclineReasonChange(event.target.value)
                      }
                      disabled={actionPending}
                      placeholder="Jelaskan alasan agar Customer memahami keputusan Anda."
                      className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={onCancelDecline}
                        disabled={actionPending}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={onConfirmDecline}
                        disabled={actionPending}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionPending ? "Memproses..." : "Konfirmasi Tolak"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {canCancel && (
              <section className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
                {actionErrorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {actionErrorMessage}
                  </div>
                )}

                {!cancellationOpen ? (
                  <button
                    type="button"
                    onClick={onOpenCancellation}
                    disabled={actionPending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={17} />
                    Batalkan Permintaan
                  </button>
                ) : (
                  <div>
                    <label
                      htmlFor="cancellation-reason"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Alasan pembatalan
                    </label>

                    <textarea
                      id="cancellation-reason"
                      rows={4}
                      value={cancellationReason}
                      onChange={(event) =>
                        onCancellationReasonChange(event.target.value)
                      }
                      disabled={actionPending}
                      placeholder="Jelaskan alasan pembatalan kepada penyedia."
                      className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={onCancelCancellation}
                        disabled={actionPending}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                      >
                        Kembali
                      </button>

                      <button
                        type="button"
                        onClick={onConfirmCancellation}
                        disabled={actionPending}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionPending
                          ? "Memproses..."
                          : "Konfirmasi Pembatalan"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
            {isProvider &&
              detail.status === ServiceRequestStatus.NEGOTIATING &&
              !declineOpen && (
                <section className="rounded-[28px] border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-sm font-bold text-indigo-800">
                    Tahap negosiasi aktif
                  </p>

                  <p className="mt-2 text-xs leading-5 text-indigo-700">
                    Permintaan sudah masuk ke tahap negosiasi dan belum menjadi
                    kesepakatan otomatis.
                  </p>
                </section>
              )}

            {isCustomer && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-950">
                  Status permintaan Anda
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {getServiceRequestStatusLabel(detail.status)}
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
