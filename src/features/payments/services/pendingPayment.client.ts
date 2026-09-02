import type {
  PendingPaymentSummary,
  PendingPaymentType,
  ResumePaymentData,
} from "../types/pendingPayment";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isPaymentType(
  value: unknown,
): value is PendingPaymentType {
  return (
    value === "DONATION" ||
    value === "URGENT_TASK"
  );
}

function isPendingPayment(
  value: unknown,
): value is PendingPaymentSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.orderId === "string" &&
    isPaymentType(value.paymentType) &&
    typeof value.amount === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.paymentExpiresAt ===
      "string"
  );
}

function isResumePaymentData(
  value: unknown,
): value is ResumePaymentData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.orderId === "string" &&
    isPaymentType(value.paymentType) &&
    typeof value.amount === "number" &&
    typeof value.snapToken === "string"
  );
}

export async function fetchPendingPayment():
Promise<PendingPaymentSummary | null> {
  const response = await fetch(
    "/api/payments/pending",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Gagal memuat pembayaran yang menunggu.",
    );
  }

  const payload: unknown =
    await response.json();

  if (
    !isRecord(payload) ||
    !("payment" in payload)
  ) {
    throw new Error(
      "Response pembayaran tidak valid.",
    );
  }

  if (payload.payment === null) {
    return null;
  }

  if (
    !isPendingPayment(
      payload.payment,
    )
  ) {
    throw new Error(
      "Data pembayaran tidak valid.",
    );
  }

  return payload.payment;
}

export async function requestResumePayment(
  orderId: string,
): Promise<ResumePaymentData> {
  const response = await fetch(
    "/api/payments/resume",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Pembayaran ini sudah tidak dapat dilanjutkan.",
      );
    }

    if (response.status === 409) {
      throw new Error(
        "Sesi pembayaran tidak tersedia.",
      );
    }

    throw new Error(
      "Gagal melanjutkan pembayaran.",
    );
  }

  const payload: unknown =
    await response.json();

  if (
    !isResumePaymentData(payload)
  ) {
    throw new Error(
      "Response resume pembayaran tidak valid.",
    );
  }

  return payload;
}