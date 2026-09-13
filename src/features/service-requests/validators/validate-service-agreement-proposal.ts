import {
  SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES,
  SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES,
  ServiceAgreementPaymentTriggerType,
} from "../constants/service-agreement";

import type {
  ProposeServiceAgreementInput,
  ServiceAgreementPaymentStepInput,
  ServiceAgreementProposalDraft,
} from "../types/service-agreement.types";

import { validateServiceRequestId } from "./validate-service-request-identity";

function parsePositiveMoney(value: string, field: string): number {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${field} harus berupa angka bulat positif.`);
  }

  const parsed = Number(normalized);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${field} tidak valid.`);
  }

  return parsed;
}

function requireTrimmed(value: string, message: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(message);
  }

  return normalized;
}

function validatePaymentStep(
  label: string,
  amount: string,
  triggerType: ServiceAgreementPaymentStepInput["triggerType"],
  triggerNote: string,
): ServiceAgreementPaymentStepInput {
  const normalizedLabel = requireTrimmed(
    label,
    "Nama tahap pembayaran wajib diisi.",
  );

  if (
    !SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.some(
      (type) => type === triggerType,
    )
  ) {
    throw new Error("Pemicu tahap pembayaran tidak valid.");
  }

  const normalizedTriggerNote = triggerNote.trim();

  if (
    triggerType === ServiceAgreementPaymentTriggerType.CUSTOM &&
    !normalizedTriggerNote
  ) {
    throw new Error("Catatan pemicu pembayaran custom wajib diisi.");
  }

  return {
    label: normalizedLabel,

    amount: parsePositiveMoney(amount, "Nominal tahap pembayaran"),

    triggerType,

    triggerNote: normalizedTriggerNote || null,
  };
}

export function validateServiceAgreementProposal(
  draft: ServiceAgreementProposalDraft,
): ProposeServiceAgreementInput {
  const requestId = validateServiceRequestId(draft.requestId);

  const scope = requireTrimmed(
    draft.scope,
    "Ruang lingkup kesepakatan wajib diisi.",
  );

  const deliverables = requireTrimmed(
    draft.deliverables,
    "Hasil pekerjaan wajib diisi.",
  );

  const totalPrice = parsePositiveMoney(draft.totalPrice, "Total harga");

  const deadlineInput = requireTrimmed(
    draft.deadline,
    "Deadline kesepakatan wajib diisi.",
  );

  const deadlineTimestamp = Date.parse(deadlineInput);

  if (Number.isNaN(deadlineTimestamp)) {
    throw new Error("Deadline kesepakatan tidak valid.");
  }

  const deadline = new Date(deadlineTimestamp).toISOString();

  const revisionTerms = requireTrimmed(
    draft.revisionTerms,
    "Ketentuan revisi wajib diisi.",
  );

  if (
    !SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.some(
      (type) => type === draft.paymentPlanType,
    )
  ) {
    throw new Error("Jenis rencana pembayaran tidak valid.");
  }

  if (draft.paymentSteps.length === 0) {
    throw new Error("Minimal satu tahap pembayaran wajib dibuat.");
  }

  const paymentSteps = draft.paymentSteps.map((step) =>
    validatePaymentStep(
      step.label,
      step.amount,
      step.triggerType,
      step.triggerNote,
    ),
  );

  let paymentTotal = 0;

  for (const step of paymentSteps) {
    paymentTotal += step.amount;

    if (!Number.isSafeInteger(paymentTotal)) {
      throw new Error("Total tahap pembayaran terlalu besar.");
    }
  }

  if (paymentTotal !== totalPrice) {
    throw new Error(
      "Jumlah seluruh tahap pembayaran harus sama dengan total harga.",
    );
  }

  const notes = draft.notes.trim();

  return {
    requestId,

    scope,

    deliverables,

    totalPrice,

    deadline,

    revisionTerms,

    paymentPlanType: draft.paymentPlanType,

    paymentSteps,

    notes: notes || null,
  };
}
