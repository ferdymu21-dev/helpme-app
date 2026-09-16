import {
  ServicePaymentAcknowledgementStatus,
  type ServicePaymentAcknowledgement,
  type ServicePaymentAcknowledgementStatusValue,
} from "../types/service-payment-acknowledgement.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SERVICE_PAYMENT_ACKNOWLEDGEMENT_STATUSES =
  Object.values(ServicePaymentAcknowledgementStatus);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Service payment field ${field} is invalid.`);
  }

  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Service payment field ${field} is invalid.`);
  }

  return value;
}

function requiredUuid(value: unknown, field: string): string {
  const parsed = requiredString(value, field);

  if (!UUID_PATTERN.test(parsed)) {
    throw new Error(`Service payment field ${field} is invalid.`);
  }

  return parsed;
}

function positiveInteger(value: unknown, field: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`Service payment field ${field} is invalid.`);
  }

  return parsed;
}

function parseStatus(
  value: unknown,
): ServicePaymentAcknowledgementStatusValue {
  if (typeof value !== "string") {
    throw new Error("Service payment status is invalid.");
  }

  const parsed =
    SERVICE_PAYMENT_ACKNOWLEDGEMENT_STATUSES.find(
      (status) => status === value,
    );

  if (!parsed) {
    throw new Error("Service payment status is invalid.");
  }

  return parsed;
}

export function parseServicePaymentAcknowledgement(
  value: unknown,
): ServicePaymentAcknowledgement {
  if (!isRecord(value)) {
    throw new Error("Service payment acknowledgement response is invalid.");
  }

  return {
    id: requiredUuid(
      value.id,
      "id",
    ),

    paymentStepId: requiredUuid(
      value.payment_step_id,
      "payment_step_id",
    ),

    serviceAgreementId: requiredUuid(
      value.service_agreement_id,
      "service_agreement_id",
    ),

    attemptNo: positiveInteger(
      value.attempt_no,
      "attempt_no",
    ),

    status: parseStatus(
      value.status,
    ),

    customerNote: nullableString(
      value.customer_note,
      "customer_note",
    ),

    customerReportedAt: requiredString(
      value.customer_reported_at,
      "customer_reported_at",
    ),

    providerConfirmedAt: nullableString(
      value.provider_confirmed_at,
      "provider_confirmed_at",
    ),

    issueReportedAt: nullableString(
      value.issue_reported_at,
      "issue_reported_at",
    ),

    issueReason: nullableString(
      value.issue_reason,
      "issue_reason",
    ),

    providerNote: nullableString(
      value.provider_note,
      "provider_note",
    ),

    createdAt: requiredString(
      value.created_at,
      "created_at",
    ),

    updatedAt: requiredString(
      value.updated_at,
      "updated_at",
    ),
  };
}
