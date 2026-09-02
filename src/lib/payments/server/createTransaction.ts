import {
  createSnapTransaction,
} from "./midtrans.server";

import type {
  MidtransExpiry,
} from "../types/midtrans";

interface CreateTransactionPayload {
  orderId: string;

  amount: number;

  options?: {
    enabled_payments?: string[];

    expiry?: MidtransExpiry;
  };
}

export async function createTransaction(
  payload: CreateTransactionPayload,
) {
  const transaction =
    await createSnapTransaction({
      transaction_details: {
        order_id:
          payload.orderId,

        gross_amount:
          payload.amount,
      },

      ...(payload.options ?? {}),
    });

  return transaction;
}