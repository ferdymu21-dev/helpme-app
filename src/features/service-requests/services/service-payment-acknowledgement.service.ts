import {
  confirmServicePaymentRepository,
  getServicePaymentAcknowledgementsRepository,
  reportServicePaymentIssueRepository,
  reportServicePaymentPaidRepository,
} from "../repositories/service-payment-acknowledgement.repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateIdentity(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim();

  if (!UUID_PATTERN.test(normalized)) {
    throw new Error(
      `${label} tidak valid.`,
    );
  }

  return normalized;
}

function normalizeOptionalNote(
  value: string,
): string | null {
  const normalized =
    value.trim();

  return normalized || null;
}

export async function getServicePaymentAcknowledgementsService(
  requestId: string,
) {
  return getServicePaymentAcknowledgementsRepository(
    validateIdentity(
      requestId,
      "Permintaan Jasa",
    ),
  );
}

export async function reportServicePaymentPaidService(
  paymentStepId: string,
  customerNote: string,
): Promise<string> {
  return reportServicePaymentPaidRepository(
    validateIdentity(
      paymentStepId,
      "Tahap pembayaran",
    ),
    normalizeOptionalNote(
      customerNote,
    ),
  );
}

export async function confirmServicePaymentService(
  acknowledgementId: string,
  providerNote: string,
): Promise<string> {
  return confirmServicePaymentRepository(
    validateIdentity(
      acknowledgementId,
      "Konfirmasi pembayaran",
    ),
    normalizeOptionalNote(
      providerNote,
    ),
  );
}

export async function reportServicePaymentIssueService(
  acknowledgementId: string,
  issueReason: string,
  providerNote: string,
): Promise<string> {
  const normalizedReason =
    issueReason.trim();

  if (!normalizedReason) {
    throw new Error(
      "Alasan masalah pembayaran wajib diisi.",
    );
  }

  return reportServicePaymentIssueRepository(
    validateIdentity(
      acknowledgementId,
      "Konfirmasi pembayaran",
    ),
    normalizedReason,
    normalizeOptionalNote(
      providerNote,
    ),
  );
}
