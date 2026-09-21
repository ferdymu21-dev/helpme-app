"use client";

import {
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES,
  SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES,
  ServiceAgreementPaymentPlanType,
  ServiceAgreementPaymentTriggerType,
  type ServiceAgreementPaymentPlanTypeValue,
  type ServiceAgreementPaymentTriggerTypeValue,
} from "./constants/service-agreement";

import type { ServiceAgreementProposalDraft } from "./types/service-agreement.types";

type ProposalTextField =
  | "scope"
  | "deliverables"
  | "totalPrice"
  | "deadline"
  | "revisionTerms"
  | "notes";

type PaymentStepTextField =
  | "label"
  | "amount"
  | "triggerNote";

interface ServiceRequestChatProposalModalProps {
  proposalDraft:
    ServiceAgreementProposalDraft;

  actionPending: boolean;

  actionErrorMessage:
    | string
    | null;

  onCancel: () => void;

  onProposalFieldChange: (
    field: ProposalTextField,
    value: string,
  ) => void;

  onPaymentPlanTypeChange: (
    value:
      ServiceAgreementPaymentPlanTypeValue,
  ) => void;

  onPaymentStepFieldChange: (
    index: number,
    field: PaymentStepTextField,
    value: string,
  ) => void;

  onPaymentStepTriggerChange: (
    index: number,
    value:
      ServiceAgreementPaymentTriggerTypeValue,
  ) => void;

  onAddPaymentStep: () => void;

  onRemovePaymentStep: (
    index: number,
  ) => void;

  onSubmit: () => void | Promise<void>;
}

function getPaymentPlanLabel(
  type:
    ServiceAgreementPaymentPlanTypeValue,
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
  type:
    ServiceAgreementPaymentTriggerTypeValue,
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

function findPaymentPlanType(
  value: string,
):
  | ServiceAgreementPaymentPlanTypeValue
  | null {
  return (
    SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.find(
      (type) => type === value,
    ) ?? null
  );
}

function findPaymentTriggerType(
  value: string,
):
  | ServiceAgreementPaymentTriggerTypeValue
  | null {
  return (
    SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.find(
      (type) => type === value,
    ) ?? null
  );
}

const textareaClassName = `
  mt-2
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
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
`;

const inputClassName = `
  mt-2
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3.5
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-100
  disabled:bg-slate-50
`;

export default function ServiceRequestChatProposalModal({
  proposalDraft,
  actionPending,
  actionErrorMessage,
  onCancel,
  onProposalFieldChange,
  onPaymentPlanTypeChange,
  onPaymentStepFieldChange,
  onPaymentStepTriggerChange,
  onAddPaymentStep,
  onRemovePaymentStep,
  onSubmit,
}: ServiceRequestChatProposalModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-slate-950/40
        sm:items-center
        sm:p-6
      "
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-proposal-title"
        className="
          flex
          max-h-[95dvh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-t-3xl
          bg-white
          shadow-2xl
          sm:max-h-[90vh]
          sm:rounded-3xl
        "
      >
        <header
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-4
            border-b
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-indigo-600
              "
            >
              Negosiasi Jasa
            </p>

            <h2
              id="chat-proposal-title"
              className="
                mt-1
                text-lg
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Buat Proposal Penawaran
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500
              "
            >
              Rincian ini akan menjadi
              proposal resmi yang dapat
              diperiksa Customer.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={actionPending}
            aria-label="Tutup proposal"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              disabled:opacity-50
            "
          >
            <X
              className="h-4 w-4"
              strokeWidth={2}
            />
          </button>
        </header>

        <div
          className="
            flex-1
            overflow-y-auto
            px-5
            py-5
            sm:px-6
          "
        >
          {actionErrorMessage && (
            <div
              role="alert"
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                leading-6
                text-red-700
              "
            >
              {actionErrorMessage}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="chat-agreement-scope"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Ruang lingkup pekerjaan
              </label>

              <textarea
                id="chat-agreement-scope"
                rows={3}
                value={proposalDraft.scope}
                onChange={(event) =>
                  onProposalFieldChange(
                    "scope",
                    event.target.value,
                  )
                }
                disabled={actionPending}
                placeholder="Jelaskan pekerjaan yang termasuk dalam kesepakatan."
                className={
                  textareaClassName
                }
              />
            </div>

            <div>
              <label
                htmlFor="chat-agreement-deliverables"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Hasil pekerjaan
              </label>

              <textarea
                id="chat-agreement-deliverables"
                rows={3}
                value={
                  proposalDraft.deliverables
                }
                onChange={(event) =>
                  onProposalFieldChange(
                    "deliverables",
                    event.target.value,
                  )
                }
                disabled={actionPending}
                placeholder="Tuliskan hasil yang akan diterima Customer."
                className={
                  textareaClassName
                }
              />
            </div>

            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor="chat-agreement-price"
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Total harga
                </label>

                <input
                  id="chat-agreement-price"
                  type="text"
                  inputMode="numeric"
                  value={
                    proposalDraft.totalPrice
                  }
                  onChange={(event) =>
                    onProposalFieldChange(
                      "totalPrice",
                      event.target.value,
                    )
                  }
                  disabled={actionPending}
                  placeholder="Contoh: 500000"
                  className={
                    inputClassName
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="chat-agreement-deadline"
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Deadline
                </label>

                <input
                  id="chat-agreement-deadline"
                  type="datetime-local"
                  value={
                    proposalDraft.deadline
                  }
                  onChange={(event) =>
                    onProposalFieldChange(
                      "deadline",
                      event.target.value,
                    )
                  }
                  disabled={actionPending}
                  className={
                    inputClassName
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="chat-agreement-revision"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Ketentuan revisi
              </label>

              <textarea
                id="chat-agreement-revision"
                rows={2}
                value={
                  proposalDraft.revisionTerms
                }
                onChange={(event) =>
                  onProposalFieldChange(
                    "revisionTerms",
                    event.target.value,
                  )
                }
                disabled={actionPending}
                placeholder="Contoh: maksimal 2 kali revisi minor."
                className={
                  textareaClassName
                }
              />
            </div>

            <div>
              <label
                htmlFor="chat-payment-plan"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Rencana pembayaran
              </label>

              <select
                id="chat-payment-plan"
                value={
                  proposalDraft.paymentPlanType
                }
                onChange={(event) => {
                  const value =
                    findPaymentPlanType(
                      event.target.value,
                    );

                  if (value) {
                    onPaymentPlanTypeChange(
                      value,
                    );
                  }
                }}
                disabled={actionPending}
                className={
                  inputClassName
                }
              >
                {SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {getPaymentPlanLabel(
                        type,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <h3
                    className="
                      text-sm
                      font-black
                      text-slate-900
                    "
                  >
                    Tahap pembayaran
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Total seluruh tahap
                    harus sama dengan harga
                    proposal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    onAddPaymentStep
                  }
                  disabled={actionPending}
                  className="
                    inline-flex
                    h-9
                    shrink-0
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
                    disabled:opacity-50
                  "
                >
                  <Plus className="h-3.5 w-3.5" />

                  Tambah
                </button>
              </div>

              <div
                className="
                  mt-4
                  space-y-3
                "
              >
                {proposalDraft.paymentSteps.map(
                  (step, index) => (
                    <div
                      key={index}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50/60
                        p-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-black
                            text-slate-900
                          "
                        >
                          Tahap {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            onRemovePaymentStep(
                              index,
                            )
                          }
                          disabled={
                            actionPending ||
                            proposalDraft
                              .paymentSteps
                              .length <= 1
                          }
                          aria-label={`Hapus tahap ${index + 1}`}
                          className="
                            rounded-lg
                            p-2
                            text-rose-500
                            transition
                            hover:bg-rose-50
                            disabled:opacity-30
                          "
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        className="
                          mt-3
                          grid
                          gap-3
                          sm:grid-cols-2
                        "
                      >
                        <div>
                          <label
                            htmlFor={`chat-step-label-${index}`}
                            className="
                              text-xs
                              font-semibold
                              text-slate-600
                            "
                          >
                            Nama tahap
                          </label>

                          <input
                            id={`chat-step-label-${index}`}
                            type="text"
                            value={
                              step.label
                            }
                            onChange={(
                              event,
                            ) =>
                              onPaymentStepFieldChange(
                                index,
                                "label",
                                event
                                  .target
                                  .value,
                              )
                            }
                            disabled={
                              actionPending
                            }
                            className={
                              inputClassName
                            }
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`chat-step-amount-${index}`}
                            className="
                              text-xs
                              font-semibold
                              text-slate-600
                            "
                          >
                            Nominal
                          </label>

                          <input
                            id={`chat-step-amount-${index}`}
                            type="text"
                            inputMode="numeric"
                            value={
                              step.amount
                            }
                            onChange={(
                              event,
                            ) =>
                              onPaymentStepFieldChange(
                                index,
                                "amount",
                                event
                                  .target
                                  .value,
                              )
                            }
                            disabled={
                              actionPending
                            }
                            placeholder="Contoh: 250000"
                            className={
                              inputClassName
                            }
                          />
                        </div>
                      </div>

                      <div
                        className="
                          mt-3
                          grid
                          gap-3
                          sm:grid-cols-2
                        "
                      >
                        <div>
                          <label
                            htmlFor={`chat-step-trigger-${index}`}
                            className="
                              text-xs
                              font-semibold
                              text-slate-600
                            "
                          >
                            Pemicu pembayaran
                          </label>

                          <select
                            id={`chat-step-trigger-${index}`}
                            value={
                              step.triggerType
                            }
                            onChange={(
                              event,
                            ) => {
                              const value =
                                findPaymentTriggerType(
                                  event
                                    .target
                                    .value,
                                );

                              if (value) {
                                onPaymentStepTriggerChange(
                                  index,
                                  value,
                                );
                              }
                            }}
                            disabled={
                              actionPending
                            }
                            className={
                              inputClassName
                            }
                          >
                            {SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.map(
                              (type) => (
                                <option
                                  key={
                                    type
                                  }
                                  value={
                                    type
                                  }
                                >
                                  {getPaymentTriggerLabel(
                                    type,
                                  )}
                                </option>
                              ),
                            )}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`chat-step-note-${index}`}
                            className="
                              text-xs
                              font-semibold
                              text-slate-600
                            "
                          >
                            Catatan pemicu
                            {step.triggerType ===
                              ServiceAgreementPaymentTriggerType.CUSTOM &&
                              " *"}
                          </label>

                          <input
                            id={`chat-step-note-${index}`}
                            type="text"
                            value={
                              step.triggerNote
                            }
                            onChange={(
                              event,
                            ) =>
                              onPaymentStepFieldChange(
                                index,
                                "triggerNote",
                                event
                                  .target
                                  .value,
                              )
                            }
                            disabled={
                              actionPending
                            }
                            placeholder={
                              step.triggerType ===
                              ServiceAgreementPaymentTriggerType.CUSTOM
                                ? "Wajib untuk pemicu custom"
                                : "Opsional"
                            }
                            className={
                              inputClassName
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="chat-agreement-notes"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Catatan tambahan
              </label>

              <textarea
                id="chat-agreement-notes"
                rows={2}
                value={proposalDraft.notes}
                onChange={(event) =>
                  onProposalFieldChange(
                    "notes",
                    event.target.value,
                  )
                }
                disabled={actionPending}
                placeholder="Opsional"
                className={
                  textareaClassName
                }
              />
            </div>
          </div>
        </div>

        <footer
          className="
            grid
            shrink-0
            grid-cols-2
            gap-3
            border-t
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onCancel}
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
              disabled:opacity-50
            "
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() =>
              void onSubmit()
            }
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
            {actionPending
              ? "Mengirim..."
              : "Ajukan Proposal"}
          </button>
        </footer>
      </section>
    </div>
  );
}