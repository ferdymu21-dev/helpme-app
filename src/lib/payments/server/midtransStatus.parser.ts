import type {
  MidtransStatusResponse,
} from "./midtrans.types";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function optionalString(
  value: unknown,
) {
  return typeof value === "string"
    ? value
    : undefined;
}

export function parseMidtransStatusResponse(
  value: unknown,
): MidtransStatusResponse {
  if (!isRecord(value)) {
    throw new Error(
      "Response status Midtrans tidak valid.",
    );
  }

  if (
    typeof value.order_id !==
      "string" ||
    typeof value.transaction_status !==
      "string"
  ) {
    throw new Error(
      "Response status Midtrans tidak lengkap.",
    );
  }

  return {
    order_id:
      value.order_id,

    transaction_status:
      value.transaction_status,

    transaction_id:
      optionalString(
        value.transaction_id,
      ),

    fraud_status:
      optionalString(
        value.fraud_status,
      ),

    payment_type:
      optionalString(
        value.payment_type,
      ),

    gross_amount:
      optionalString(
        value.gross_amount,
      ),

    status_code:
      optionalString(
        value.status_code,
      ),

    status_message:
      optionalString(
        value.status_message,
      ),

    settlement_time:
      optionalString(
        value.settlement_time,
      ),

    expiry_time:
      optionalString(
        value.expiry_time,
      ),
  };
}

export function getMidtransHttpStatusCode(
  error: unknown,
): number | null {
  if (!isRecord(error)) {
    return null;
  }

  const httpStatusCode =
    error.httpStatusCode;

  return typeof httpStatusCode ===
    "number"
    ? httpStatusCode
    : null;
}