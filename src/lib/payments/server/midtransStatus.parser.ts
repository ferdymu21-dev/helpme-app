import type { MidtransStatusResponse } from "./midtrans.types";

import {
  normalizeMidtransTimestamp,
} from "./midtransTimestamp";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export function parseMidtransStatusResponse(
  value: unknown,
): MidtransStatusResponse {
  if (!isRecord(value)) {
    throw new Error("Response status Midtrans tidak valid.");
  }

  if (
    typeof value.order_id !== "string" ||
    typeof value.transaction_status !== "string"
  ) {
    throw new Error("Response status Midtrans tidak lengkap.");
  }

  return {
    order_id: value.order_id,

    transaction_status: value.transaction_status,

    transaction_id: optionalString(value.transaction_id),

    fraud_status: optionalString(value.fraud_status),

    payment_type: optionalString(value.payment_type),

    gross_amount: optionalString(value.gross_amount),

    status_code: optionalString(value.status_code),

    status_message: optionalString(value.status_message),

    settlement_time:
      normalizeMidtransTimestamp(
        optionalString(
         value.settlement_time,
        ),
      ),

   expiry_time:
    normalizeMidtransTimestamp(
      optionalString(
        value.expiry_time,
      ),
    ),
  };
}

function parseHttpStatusCode(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d{3}$/.test(value)) {
    return Number(value);
  }

  return null;
}

export function getMidtransHttpStatusCode(error: unknown): number | null {
  if (!isRecord(error)) {
    return null;
  }

  /*
   * Midtrans SDK dapat mengembalikan:
   *
   * httpStatusCode: 404
   *
   * maupun:
   *
   * httpStatusCode: "404"
   */
  const directStatus = parseHttpStatusCode(error.httpStatusCode);

  if (directStatus !== null) {
    return directStatus;
  }

  /*
   * Fallback untuk bentuk error SDK
   * yang menyimpan status di ApiResponse.
   */
  const apiResponse = error.ApiResponse;

  if (!isRecord(apiResponse)) {
    return null;
  }

  return parseHttpStatusCode(apiResponse.status_code);
}