"use client";

import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  History,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES,
  SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES,
  ServiceAgreementPaymentPlanType,
  ServiceAgreementPaymentTriggerType,
  ServiceAgreementStatus,
  type ServiceAgreementPaymentPlanTypeValue,
  type ServiceAgreementPaymentTriggerTypeValue,
} from "./constants/service-agreement";

import {
  ServiceRequestStatus,
  type ServiceRequestStatusValue,
} from "./constants/service-request-status";

import { useServiceAgreementPanel } from "./hooks/useServiceAgreementPanel";

import type { ServiceAgreement } from "./types/service-agreement.types";

import {
  ServicePaymentAcknowledgementStatus,
  type ServicePaymentAcknowledgement,
} from "./types/service-payment-acknowledgement.types";

import { formatServiceRequestDateTime } from "./utils/service-request-display";

interface ServiceAgreementPanelProps {
  requestId: string;

  requestStatus: ServiceRequestStatusValue;

  isProvider: boolean;

  isCustomer: boolean;

  onRequestChanged: () => void | Promise<void>;
}

function getAgreementStatusLabel(status: ServiceAgreement["status"]): string {
  switch (status) {
    case ServiceAgreementStatus.PROPOSED:
      return "Menunggu Persetujuan";

    case ServiceAgreementStatus.APPROVED:
      return "Disetujui";

    case ServiceAgreementStatus.REJECTED:
      return "Ditolak";

    case ServiceAgreementStatus.SUPERSEDED:
      return "Digantikan";
  }
}

function getPaymentPlanLabel(
  type: ServiceAgreementPaymentPlanTypeValue,
): string {
  switch (type) {
    case ServiceAgreementPaymentPlanType.AFTER_COMPLETION:
      return "Setelah pekerjaan selesai";

    case ServiceAgreementPaymentPlanType.DEPOSIT_FINAL:
      return "Deposit + pelunasan";

    case ServiceAgreementPaymentPlanType.MILESTONES:
      return "Bertahap / milestone";

    case ServiceAgreementPaymentPlanType.FULL_UPFRONT:
      return "Lunas di awal";
  }
}

function getPaymentTriggerLabel(
  type: ServiceAgreementPaymentTriggerTypeValue,
): string {
  switch (type) {
    case ServiceAgreementPaymentTriggerType.UPFRONT:
      return "Di awal";

    case ServiceAgreementPaymentTriggerType.BEFORE_START:
      return "Sebelum mulai";

    case ServiceAgreementPaymentTriggerType.MILESTONE:
      return "Milestone";

    case ServiceAgreementPaymentTriggerType.ON_SUBMISSION:
      return "Saat hasil dikirim";

    case ServiceAgreementPaymentTriggerType.AFTER_COMPLETION:
      return "Setelah selesai";

    case ServiceAgreementPaymentTriggerType.CUSTOM:
      return "Custom";
  }
}

function getLatestPaymentAcknowledgement(
  acknowledgements: ServicePaymentAcknowledgement[],
  paymentStepId: string,
): ServicePaymentAcknowledgement | null {
  return acknowledgements.reduce<ServicePaymentAcknowledgement | null>(
    (latest, acknowledgement) => {
      if (acknowledgement.paymentStepId !== paymentStepId) {
        return latest;
      }

      if (!latest || acknowledgement.attemptNo > latest.attemptNo) {
        return acknowledgement;
      }

      return latest;
    },
    null,
  );
}

function getPaymentAcknowledgementStatusLabel(
  acknowledgement: ServicePaymentAcknowledgement | null,
): string {
  if (!acknowledgement) {
    return "Belum dilaporkan";
  }

  switch (acknowledgement.status) {
    case ServicePaymentAcknowledgementStatus.CUSTOMER_REPORTED_PAID:
      return "Menunggu konfirmasi penyedia";

    case ServicePaymentAcknowledgementStatus.PROVIDER_CONFIRMED:
      return "Pembayaran dikonfirmasi";

    case ServicePaymentAcknowledgementStatus.PAYMENT_ISSUE:
      return "Masalah pembayaran";
  }
}

function isPaymentStepAvailableForCustomerReport(
  triggerType: ServiceAgreementPaymentTriggerTypeValue,
  requestStatus: ServiceRequestStatusValue,
): boolean {
  switch (triggerType) {
    case ServiceAgreementPaymentTriggerType.UPFRONT:
    case ServiceAgreementPaymentTriggerType.BEFORE_START:
    case ServiceAgreementPaymentTriggerType.CUSTOM:
      return (
        requestStatus === ServiceRequestStatus.AGREED ||
        requestStatus === ServiceRequestStatus.IN_PROGRESS ||
        requestStatus === ServiceRequestStatus.SUBMITTED ||
        requestStatus === ServiceRequestStatus.COMPLETED
      );

    case ServiceAgreementPaymentTriggerType.MILESTONE:
      return (
        requestStatus === ServiceRequestStatus.IN_PROGRESS ||
        requestStatus === ServiceRequestStatus.SUBMITTED ||
        requestStatus === ServiceRequestStatus.COMPLETED
      );

    case ServiceAgreementPaymentTriggerType.ON_SUBMISSION:
      return (
        requestStatus === ServiceRequestStatus.SUBMITTED ||
        requestStatus === ServiceRequestStatus.COMPLETED
      );

    case ServiceAgreementPaymentTriggerType.AFTER_COMPLETION:
      return requestStatus === ServiceRequestStatus.COMPLETED;
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function findPaymentPlanType(
  value: string,
): ServiceAgreementPaymentPlanTypeValue | null {
  return (
    SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.find((type) => type === value) ?? null
  );
}

function findPaymentTriggerType(
  value: string,
): ServiceAgreementPaymentTriggerTypeValue | null {
  return (
    SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.find((type) => type === value) ??
    null
  );
}

export default function ServiceAgreementPanel({
  requestId,
  requestStatus,
  isProvider,
  isCustomer,
  onRequestChanged,
}: ServiceAgreementPanelProps) {
  const {
    agreements,
    paymentAcknowledgements,
    latestAgreement,
    loading,
    loadErrorMessage,
    actionErrorMessage,
    actionPending,
    canPropose,
    canCustomerRespond,
    proposalOpen,
    proposalDraft,
    rejectionOpen,
    rejectionReason,
    paymentIssueAcknowledgementId,
    paymentIssueReason,
    refresh,
    onOpenProposal,
    onCancelProposal,
    onProposalFieldChange,
    onPaymentPlanTypeChange,
    onPaymentStepFieldChange,
    onPaymentStepTriggerChange,
    onAddPaymentStep,
    onRemovePaymentStep,
    onSubmitProposal,
    onApproveAgreement,
    onOpenRejection,
    onCancelRejection,
    onRejectAgreement,
    onRejectionReasonChange,
    onReportPaymentPaid,
    onConfirmPayment,
    onOpenPaymentIssue,
    onCancelPaymentIssue,
    onPaymentIssueReasonChange,
    onReportPaymentIssue,
  } = useServiceAgreementPanel({
    requestId,
    requestStatus,
    isProvider,
    isCustomer,
    onRequestChanged,
  });

  if (!isProvider && !isCustomer) {
    return null;
  }

  return (
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            Kesepakatan Jasa
          </p>

          <h2 className="mt-2 text-[13px] font-bold text-slate-950">
            Detail Kesepakatan
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
            Proposal, pembayaran, dan versi kesepakatan tercatat tanpa menghapus
            riwayat sebelumnya.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="
  inline-flex
  h-9
  shrink-0
  items-center
  gap-2
  rounded-xl
  px-3
  text-xs
  font-bold
  text-slate-500
  transition
  hover:bg-slate-50
  hover:text-slate-900
  disabled:cursor-not-allowed
  disabled:opacity-50
"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : undefined}
          />
          Muat ulang
        </button>
      </div>

      {loadErrorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {loadErrorMessage}
        </div>
      )}

      {actionErrorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {actionErrorMessage}
        </div>
      )}

      {canPropose && !proposalOpen && (
        <div
          className="
    mt-6
    rounded-2xl
    border
    border-indigo-100
    bg-indigo-50/60
    p-5
  "
        >
          <h3
            className="
    text-sm
    font-black
    text-slate-950
  "
          >
            Buat proposal kesepakatan
          </h3>

          <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-600">
            Tentukan ruang lingkup, hasil pekerjaan, harga, deadline, dan jadwal
            pembayaran untuk diajukan kepada Customer.
          </p>

          <button
            type="button"
            onClick={onOpenProposal}
            disabled={actionPending}
            className="
  mt-4
  inline-flex
  min-h-11
  items-center
  justify-center
  gap-2
  rounded-xl
  bg-indigo-600
  px-4
  text-sm
  font-black
  text-white
  transition
  hover:bg-indigo-700
  active:scale-[0.99]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
          >
            <FileText size={17} />
            Buat Proposal
          </button>
        </div>
      )}

      {canPropose && proposalOpen && (
        <div
          className="
    mt-6
    rounded-2xl
    border
    border-indigo-100
    bg-indigo-50/40
    p-4
    sm:p-5
  "
        >
          <h3
            className="
    text-base
    font-black
    tracking-tight
    text-slate-950
  "
          >
            Proposal Kesepakatan
          </h3>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="agreement-scope"
                className="text-sm font-semibold text-slate-800"
              >
                Ruang lingkup pekerjaan
              </label>

              <textarea
                id="agreement-scope"
                rows={4}
                value={proposalDraft.scope}
                onChange={(event) =>
                  onProposalFieldChange("scope", event.target.value)
                }
                disabled={actionPending}
                placeholder="Jelaskan pekerjaan yang termasuk dalam kesepakatan."
                className="
  mt-2
  w-full
  resize-y
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3.5
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
              />
            </div>

            <div>
              <label
                htmlFor="agreement-deliverables"
                className="text-sm font-semibold text-slate-800"
              >
                Hasil pekerjaan
              </label>

              <textarea
                id="agreement-deliverables"
                rows={4}
                value={proposalDraft.deliverables}
                onChange={(event) =>
                  onProposalFieldChange("deliverables", event.target.value)
                }
                disabled={actionPending}
                placeholder="Tuliskan hasil atau deliverable yang akan diterima Customer."
                className="
  mt-2
  w-full
  resize-y
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3.5
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="agreement-total-price"
                  className="text-sm font-semibold text-slate-800"
                >
                  Total harga
                </label>

                <input
                  id="agreement-total-price"
                  type="text"
                  inputMode="numeric"
                  value={proposalDraft.totalPrice}
                  onChange={(event) =>
                    onProposalFieldChange("totalPrice", event.target.value)
                  }
                  disabled={actionPending}
                  placeholder="Contoh: 500000"
                  className="
  mt-2
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
                />
              </div>

              <div>
                <label
                  htmlFor="agreement-deadline"
                  className="text-sm font-semibold text-slate-800"
                >
                  Deadline
                </label>

                <input
                  id="agreement-deadline"
                  type="datetime-local"
                  value={proposalDraft.deadline}
                  onChange={(event) =>
                    onProposalFieldChange("deadline", event.target.value)
                  }
                  disabled={actionPending}
                  className="
  mt-2
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="agreement-revision-terms"
                className="text-sm font-semibold text-slate-800"
              >
                Ketentuan revisi
              </label>

              <textarea
                id="agreement-revision-terms"
                rows={3}
                value={proposalDraft.revisionTerms}
                onChange={(event) =>
                  onProposalFieldChange("revisionTerms", event.target.value)
                }
                disabled={actionPending}
                placeholder="Contoh: maksimal 2 kali revisi minor."
                className="
  mt-2
  w-full
  resize-y
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3.5
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
              />
            </div>

            <div>
              <label
                htmlFor="agreement-payment-plan"
                className="text-sm font-semibold text-slate-800"
              >
                Rencana pembayaran
              </label>

              <select
                id="agreement-payment-plan"
                value={proposalDraft.paymentPlanType}
                onChange={(event) => {
                  const value = findPaymentPlanType(event.target.value);

                  if (value) {
                    onPaymentPlanTypeChange(value);
                  }
                }}
                disabled={actionPending}
                className="
  mt-2
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-950
  outline-none
  transition
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
              >
                {SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getPaymentPlanLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Tahap pembayaran
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Jumlah seluruh tahap harus sama dengan total harga.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onAddPaymentStep}
                  disabled={actionPending}
                  className="
  inline-flex
  h-9
  items-center
  gap-1.5
  rounded-xl
  border
  border-indigo-200
  bg-white
  px-3
  text-xs
  font-bold
  text-indigo-700
  transition
  hover:bg-indigo-50
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                >
                  <Plus size={15} />
                  Tambah
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {proposalDraft.paymentSteps.map((step, index) => (
                  <div
                    key={index}
                    className="
  rounded-2xl
  border
  border-slate-200
  bg-white
  p-4
  shadow-sm
"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        Tahap {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => onRemovePaymentStep(index)}
                        disabled={
                          actionPending ||
                          proposalDraft.paymentSteps.length <= 1
                        }
                        aria-label={`Hapus tahap pembayaran ${index + 1}`}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`agreement-step-label-${index}`}
                          className="
  mt-1.5
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
                        >
                          Nama tahap
                        </label>

                        <input
                          id={`agreement-step-label-${index}`}
                          type="text"
                          value={step.label}
                          onChange={(event) =>
                            onPaymentStepFieldChange(
                              index,
                              "label",
                              event.target.value,
                            )
                          }
                          disabled={actionPending}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`agreement-step-amount-${index}`}
                          className="
  mt-1.5
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
                        >
                          Nominal
                        </label>

                        <input
                          id={`agreement-step-amount-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={step.amount}
                          onChange={(event) =>
                            onPaymentStepFieldChange(
                              index,
                              "amount",
                              event.target.value,
                            )
                          }
                          disabled={actionPending}
                          placeholder="Contoh: 250000"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`agreement-step-trigger-${index}`}
                          className="text-xs font-semibold text-slate-600"
                        >
                          Pemicu pembayaran
                        </label>

                        <select
                          id={`agreement-step-trigger-${index}`}
                          value={step.triggerType}
                          onChange={(event) => {
                            const value = findPaymentTriggerType(
                              event.target.value,
                            );

                            if (value) {
                              onPaymentStepTriggerChange(index, value);
                            }
                          }}
                          disabled={actionPending}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                        >
                          {SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.map(
                            (type) => (
                              <option key={type} value={type}>
                                {getPaymentTriggerLabel(type)}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`agreement-step-note-${index}`}
                          className="
  mt-1.5
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
"
                        >
                          Catatan pemicu
                          {step.triggerType ===
                            ServiceAgreementPaymentTriggerType.CUSTOM && " *"}
                        </label>

                        <input
                          id={`agreement-step-note-${index}`}
                          type="text"
                          value={step.triggerNote}
                          onChange={(event) =>
                            onPaymentStepFieldChange(
                              index,
                              "triggerNote",
                              event.target.value,
                            )
                          }
                          disabled={actionPending}
                          placeholder={
                            step.triggerType ===
                            ServiceAgreementPaymentTriggerType.CUSTOM
                              ? "Wajib untuk pemicu custom"
                              : "Opsional"
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="agreement-notes"
                className="text-sm font-semibold text-slate-800"
              >
                Catatan tambahan
              </label>

              <textarea
                id="agreement-notes"
                rows={3}
                value={proposalDraft.notes}
                onChange={(event) =>
                  onProposalFieldChange("notes", event.target.value)
                }
                disabled={actionPending}
                placeholder="Opsional"
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onCancelProposal}
                disabled={actionPending}
                className="
  min-h-12
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  font-bold
  text-slate-700
  transition
  hover:bg-slate-50
  disabled:cursor-not-allowed
  disabled:opacity-50
"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={onSubmitProposal}
                disabled={actionPending}
                className="
  min-h-12
  rounded-xl
  bg-indigo-600
  px-4
  text-sm
  font-black
  text-white
  transition
  hover:bg-indigo-700
  active:scale-[0.99]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
              >
                {actionPending ? "Mengirim..." : "Ajukan Kesepakatan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {canCustomerRespond && latestAgreement && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h3 className="font-bold text-slate-950">
            Proposal menunggu keputusan Anda
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Periksa rincian proposal versi {latestAgreement.version} sebelum
            menyetujui atau menolaknya.
          </p>

          {!rejectionOpen ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onApproveAgreement}
                disabled={actionPending}
                className="
  inline-flex
  min-h-12
  items-center
  justify-center
  gap-2
  rounded-xl
  bg-emerald-600
  px-4
  text-sm
  font-black
  text-white
  transition
  hover:bg-emerald-700
  disabled:cursor-not-allowed
  disabled:opacity-50
"
              >
                <CheckCircle2 size={17} />
                {actionPending ? "Memproses..." : "Setujui Kesepakatan"}
              </button>

              <button
                type="button"
                onClick={onOpenRejection}
                disabled={actionPending}
                className="
  inline-flex
  min-h-12
  items-center
  justify-center
  gap-2
  rounded-xl
  border
  border-rose-200
  bg-white
  px-4
  text-sm
  font-bold
  text-rose-600
  transition
  hover:bg-rose-50
  disabled:cursor-not-allowed
  disabled:opacity-50
"
              >
                <XCircle size={17} />
                Tolak Proposal
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <label
                htmlFor="agreement-rejection-reason"
                className="text-sm font-semibold text-slate-800"
              >
                Alasan penolakan
              </label>

              <textarea
                id="agreement-rejection-reason"
                rows={4}
                value={rejectionReason}
                onChange={(event) =>
                  onRejectionReasonChange(event.target.value)
                }
                disabled={actionPending}
                placeholder="Jelaskan bagian proposal yang perlu diperbaiki."
                className="
  mt-2
  w-full
  resize-y
  rounded-xl
  border
  border-rose-200
  bg-white
  px-4
  py-3.5
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-rose-400
  focus:ring-4
  focus:ring-rose-100
  disabled:bg-slate-50
"
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onCancelRejection}
                  disabled={actionPending}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={onRejectAgreement}
                  disabled={actionPending}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {actionPending ? "Memproses..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-7 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2.5">
          <History size={18} className="text-slate-500" />

          <h3 className="text-sm font-black text-slate-950">
            Riwayat Kesepakatan
          </h3>
        </div>

        {loading && agreements.length === 0 ? (
          <div className="mt-4 space-y-3">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : agreements.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
            Belum ada proposal kesepakatan untuk Permintaan Jasa ini.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {agreements.map((agreement) => (
              <article
                key={agreement.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        Versi {agreement.version}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {getAgreementStatusLabel(agreement.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-bold text-slate-950">
                      {formatMoney(agreement.totalPrice)}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500">
                    {formatServiceRequestDateTime(agreement.createdAt)}
                  </p>
                </div>

                <div className="mt-5 grid gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Ruang lingkup
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {agreement.scope}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Hasil pekerjaan
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {agreement.deliverables}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays size={14} />
                        Deadline
                      </p>

                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {formatServiceRequestDateTime(agreement.deadline)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CircleDollarSign size={14} />
                        Rencana pembayaran
                      </p>

                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {getPaymentPlanLabel(agreement.paymentPlanType)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Ketentuan revisi
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {agreement.revisionTerms}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Tahap pembayaran
                    </p>

                    <div className="mt-2 space-y-2">
                      {agreement.paymentSteps.map((step) => {
                        const latestAcknowledgement =
                          getLatestPaymentAcknowledgement(
                            paymentAcknowledgements,
                            step.id,
                          );

                        const isAwaitingProvider =
                          latestAcknowledgement?.status ===
                          ServicePaymentAcknowledgementStatus.CUSTOMER_REPORTED_PAID;

                        const hasPaymentIssue =
                          latestAcknowledgement?.status ===
                          ServicePaymentAcknowledgementStatus.PAYMENT_ISSUE;

                        const canCustomerReport = Boolean(
                          isCustomer &&
                          agreement.status ===
                            ServiceAgreementStatus.APPROVED &&
                          (!latestAcknowledgement || hasPaymentIssue) &&
                          isPaymentStepAvailableForCustomerReport(
                            step.triggerType,
                            requestStatus,
                          ),
                        );

                        const canProviderRespond = Boolean(
                          isProvider &&
                          agreement.status ===
                            ServiceAgreementStatus.APPROVED &&
                          isAwaitingProvider &&
                          latestAcknowledgement,
                        );

                        const issueFormOpen = Boolean(
                          latestAcknowledgement &&
                          paymentIssueAcknowledgementId ===
                            latestAcknowledgement.id,
                        );

                        return (
                          <div
                            key={step.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <div
                              className="
    flex
    flex-col
    gap-3
    p-4
    sm:flex-row
    sm:items-start
    sm:justify-between
  "
                            >
                              <div>
                                <p
                                  className="
    text-sm
    font-black
    text-slate-950
  "
                                >
                                  {step.sequenceNo}. {step.label}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {getPaymentTriggerLabel(step.triggerType)}

                                  {step.triggerNote
                                    ? ` — ${step.triggerNote}`
                                    : ""}
                                </p>
                              </div>

                              <p
                                className="
    shrink-0
    text-base
    font-black
    text-slate-950
  "
                              >
                                {formatMoney(step.amount)}
                              </p>
                            </div>

                            <div
                              className="
    border-t
    border-slate-100
    bg-slate-50/70
    p-4
  "
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p
                                    className="
    text-[9px]
    font-bold
    uppercase
    tracking-[0.12em]
    text-slate-400
  "
                                  >
                                    Status pembayaran
                                  </p>

                                  <p
                                    className="
    mt-1
    text-sm
    font-black
    text-slate-900
  "
                                  >
                                    {getPaymentAcknowledgementStatusLabel(
                                      latestAcknowledgement,
                                    )}
                                  </p>

                                  {latestAcknowledgement && (
                                    <p
                                      className="
      mt-1
      text-[10px]
      font-medium
      text-slate-400
    "
                                    >
                                      Percobaan #
                                      {latestAcknowledgement.attemptNo}
                                    </p>
                                  )}
                                </div>

                                {canCustomerReport && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void onReportPaymentPaid(step.id)
                                    }
                                    disabled={actionPending}
                                    className="
  inline-flex
  min-h-10
  items-center
  justify-center
  rounded-xl
  bg-indigo-600
  px-4
  text-xs
  font-black
  text-white
  transition
  hover:bg-indigo-700
  active:scale-[0.99]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                                  >
                                    {hasPaymentIssue
                                      ? "Lapor Ulang Pembayaran"
                                      : "Lapor Sudah Bayar"}
                                  </button>
                                )}
                              </div>

                              {latestAcknowledgement?.customerNote && (
                                <div
                                  className="
    mt-3
    rounded-xl
    border
    border-slate-200
    bg-white
    p-3.5
  "
                                >
                                  <p
                                    className="
    text-[9px]
    font-bold
    uppercase
    tracking-wide
    text-slate-400
  "
                                  >
                                    Catatan Customer
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {latestAcknowledgement.customerNote}
                                  </p>
                                </div>
                              )}

                              {hasPaymentIssue &&
                                latestAcknowledgement?.issueReason && (
                                  <div
                                    className="
    mt-3
    rounded-xl
    border
    border-rose-200
    bg-rose-50
    p-3.5
  "
                                  >
                                    <p className="text-xs font-bold uppercase tracking-wide text-rose-500">
                                      Alasan masalah
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-rose-700">
                                      {latestAcknowledgement.issueReason}
                                    </p>
                                  </div>
                                )}

                              {latestAcknowledgement?.providerNote && (
                                <div
                                  className="
    mt-3
    rounded-xl
    border
    border-slate-200
    bg-white
    p-3.5
  "
                                >
                                  <p
                                    className="
    text-[9px]
    font-bold
    uppercase
    tracking-wide
    text-slate-400
  "
                                  >
                                    Catatan Penyedia
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {latestAcknowledgement.providerNote}
                                  </p>
                                </div>
                              )}

                              {canProviderRespond &&
                                latestAcknowledgement &&
                                !issueFormOpen && (
                                  <div
                                    className="
    mt-4
    grid
    gap-2
    sm:grid-cols-2
  "
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void onConfirmPayment(
                                          latestAcknowledgement.id,
                                        )
                                      }
                                      disabled={actionPending}
                                      className="
  inline-flex
  min-h-11
  items-center
  justify-center
  rounded-xl
  bg-emerald-600
  px-4
  text-xs
  font-black
  text-white
  transition
  hover:bg-emerald-700
  active:scale-[0.99]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                                    >
                                      Konfirmasi Pembayaran
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenPaymentIssue(
                                          latestAcknowledgement.id,
                                        )
                                      }
                                      disabled={actionPending}
                                      className="
  inline-flex
  min-h-11
  items-center
  justify-center
  rounded-xl
  border
  border-rose-200
  bg-white
  px-4
  text-xs
  font-bold
  text-rose-600
  transition
  hover:bg-rose-50
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                                    >
                                      Laporkan Masalah
                                    </button>
                                  </div>
                                )}

                              {canProviderRespond &&
                                latestAcknowledgement &&
                                issueFormOpen && (
                                  <div
                                    className="
    mt-4
    rounded-xl
    border
    border-rose-200
    bg-white
    p-4
  "
                                  >
                                    <label
                                      htmlFor={`payment-issue-${latestAcknowledgement.id}`}
                                      className="text-xs font-bold text-slate-700"
                                    >
                                      Alasan masalah pembayaran
                                    </label>

                                    <textarea
                                      id={`payment-issue-${latestAcknowledgement.id}`}
                                      rows={3}
                                      value={paymentIssueReason}
                                      onChange={(event) =>
                                        onPaymentIssueReasonChange(
                                          event.target.value,
                                        )
                                      }
                                      disabled={actionPending}
                                      placeholder="Contoh: nominal yang diterima belum sesuai."
                                      className="
  mt-2
  w-full
  resize-y
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  py-3
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-rose-400
  focus:ring-4
  focus:ring-rose-100
  disabled:bg-slate-50
"
                                    />

                                    <div
                                      className="
    mt-3
    grid
    grid-cols-2
    gap-2
  "
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void onReportPaymentIssue()
                                        }
                                        disabled={actionPending}
                                        className="
  min-h-11
  rounded-xl
  bg-rose-600
  px-3
  text-xs
  font-black
  text-white
  transition
  hover:bg-rose-700
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                                      >
                                        Kirim Laporan Masalah
                                      </button>

                                      <button
                                        type="button"
                                        onClick={onCancelPaymentIssue}
                                        disabled={actionPending}
                                        className="
  min-h-11
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-xs
  font-bold
  text-slate-600
  transition
  hover:bg-slate-50
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {agreement.notes && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Catatan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {agreement.notes}
                      </p>
                    </div>
                  )}

                  {agreement.status === ServiceAgreementStatus.REJECTED &&
                    agreement.rejectionReason && (
                      <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                          Alasan penolakan
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          {agreement.rejectionReason}
                        </p>
                      </div>
                    )}

                  {agreement.status === ServiceAgreementStatus.APPROVED &&
                    agreement.approvedAt && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-sm font-semibold text-emerald-700">
                          Disetujui{" "}
                          {formatServiceRequestDateTime(agreement.approvedAt)}
                        </p>
                      </div>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}