import {
  SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES,
  SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES,
  SERVICE_AGREEMENT_STATUSES,
  type ServiceAgreementPaymentPlanTypeValue,
  type ServiceAgreementPaymentTriggerTypeValue,
  type ServiceAgreementStatusValue,
} from "../constants/service-agreement";

import type {
  ServiceAgreement,
  ServiceAgreementPaymentStep,
} from "../types/service-agreement.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Agreement field ${field} is invalid.`);
  }

  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Agreement field ${field} is invalid.`);
  }

  return value;
}

function requiredUuid(value: unknown, field: string): string {
  const parsed = requiredString(value, field);

  if (!UUID_PATTERN.test(parsed)) {
    throw new Error(`Agreement field ${field} is invalid.`);
  }

  return parsed;
}

function nullableUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return requiredUuid(value, field);
}

function parseSafeInteger(
  value: unknown,
  field: string,
  minimum: number,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(`Agreement field ${field} is invalid.`);
  }

  return parsed;
}

function parseAgreementStatus(value: unknown): ServiceAgreementStatusValue {
  if (typeof value !== "string") {
    throw new Error("Agreement status is invalid.");
  }

  const parsed = SERVICE_AGREEMENT_STATUSES.find((status) => status === value);

  if (!parsed) {
    throw new Error("Agreement status is invalid.");
  }

  return parsed;
}
function parsePaymentPlanType(
  value: unknown,
): ServiceAgreementPaymentPlanTypeValue {
  if (typeof value !== "string") {
    throw new Error("Agreement payment plan type is invalid.");
  }

  const parsed = SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.find(
    (type) => type === value,
  );

  if (!parsed) {
    throw new Error("Agreement payment plan type is invalid.");
  }

  return parsed;
}
function parsePaymentTriggerType(
  value: unknown,
): ServiceAgreementPaymentTriggerTypeValue {
  if (typeof value !== "string") {
    throw new Error("Agreement payment trigger type is invalid.");
  }

  const parsed = SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.find(
    (type) => type === value,
  );

  if (!parsed) {
    throw new Error("Agreement payment trigger type is invalid.");
  }

  return parsed;
}
function parsePaymentStep(value: unknown): ServiceAgreementPaymentStep {
  if (!isRecord(value)) {
    throw new Error("Agreement payment step is invalid.");
  }

  return {
    id: requiredUuid(value.id, "payment_steps.id"),

    sequenceNo: parseSafeInteger(
      value.sequence_no,
      "payment_steps.sequence_no",
      1,
    ),

    label: requiredString(value.label, "payment_steps.label"),

    amount: parseSafeInteger(value.amount, "payment_steps.amount", 1),

    triggerType: parsePaymentTriggerType(value.trigger_type),

    triggerNote: nullableString(
      value.trigger_note,
      "payment_steps.trigger_note",
    ),

    createdAt: requiredString(value.created_at, "payment_steps.created_at"),
  };
}

export function parseServiceAgreement(value: unknown): ServiceAgreement {
  if (!isRecord(value)) {
    throw new Error("Agreement response is invalid.");
  }

  if (!Array.isArray(value.payment_steps)) {
    throw new Error("Agreement payment steps are invalid.");
  }

  return {
    id: requiredUuid(value.id, "id"),

    serviceRequestId: requiredUuid(
      value.service_request_id,
      "service_request_id",
    ),

    version: parseSafeInteger(value.version, "version", 1),

    supersedesAgreementId: nullableUuid(
      value.supersedes_agreement_id,
      "supersedes_agreement_id",
    ),

    scope: requiredString(value.scope, "scope"),

    deliverables: requiredString(value.deliverables, "deliverables"),

    totalPrice: parseSafeInteger(value.total_price, "total_price", 1),

    priorConfirmedAmount: parseSafeInteger(
      value.prior_confirmed_amount,
      "prior_confirmed_amount",
      0,
    ),

    deadline: requiredString(value.deadline, "deadline"),

    revisionTerms: requiredString(value.revision_terms, "revision_terms"),

    paymentPlanType: parsePaymentPlanType(value.payment_plan_type),

    notes: nullableString(value.notes, "notes"),

    status: parseAgreementStatus(value.status),

    proposedBy: requiredUuid(value.proposed_by, "proposed_by"),

    approvedAt: nullableString(value.approved_at, "approved_at"),

    rejectedAt: nullableString(value.rejected_at, "rejected_at"),

    rejectionReason: nullableString(value.rejection_reason, "rejection_reason"),

    supersededAt: nullableString(value.superseded_at, "superseded_at"),

    createdAt: requiredString(value.created_at, "created_at"),

    paymentSteps: value.payment_steps.map(parsePaymentStep),
  };
}
