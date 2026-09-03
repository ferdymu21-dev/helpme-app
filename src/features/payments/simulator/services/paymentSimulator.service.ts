import type {
  SimulatorPayment,
} from "../types/paymentSimulator";

interface PaymentSyncResponse {
  success: boolean;

  orderId: string;

  paymentType: string;

  helpMeBefore: string;

  midtransStatus: string;

  helpMeAfter: string;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function parsePaymentSyncResponse(
  value: unknown,
): PaymentSyncResponse {
  if (
    !isRecord(value) ||
    value.success !== true ||
    typeof value.orderId !==
      "string" ||
    typeof value.paymentType !==
      "string" ||
    typeof value.helpMeBefore !==
      "string" ||
    typeof value.midtransStatus !==
      "string" ||
    typeof value.helpMeAfter !==
      "string"
  ) {
    throw new Error(
      "Response sinkronisasi payment tidak valid.",
    );
  }

  return {
    success: true,

    orderId:
      value.orderId,

    paymentType:
      value.paymentType,

    helpMeBefore:
      value.helpMeBefore,

    midtransStatus:
      value.midtransStatus,

    helpMeAfter:
      value.helpMeAfter,
  };
}

export async function loadPaymentTypes():
Promise<string[]> {
  const response =
    await fetch(
      "/api/dev/payment/types",
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load payment types.",
    );
  }

  return await response.json();
}

export async function loadPayments(
  paymentType: string,
): Promise<SimulatorPayment[]> {
  const response =
    await fetch(
      `/api/dev/payment/list?paymentType=${paymentType}`,
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load payments.",
    );
  }

  return await response.json();
}

export async function syncPaymentWithMidtrans(
  orderId: string,
): Promise<PaymentSyncResponse> {
  const response =
    await fetch(
      "/api/dev/payment/sync",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            orderId,
          }),
      },
    );

  const data: unknown =
    await response.json();

  if (!response.ok) {
    if (
      isRecord(data) &&
      typeof data.message ===
        "string"
    ) {
      throw new Error(
        data.message,
      );
    }

    throw new Error(
      "Sinkronisasi payment gagal.",
    );
  }

  return parsePaymentSyncResponse(
    data,
  );
}