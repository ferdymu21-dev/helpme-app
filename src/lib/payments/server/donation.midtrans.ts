import { paymentLog } from "@/lib/monitoring/payment.logger";

import { createTransaction } from "./createTransaction";

import type { MidtransExpiry } from "../types/midtrans";

export async function createMidtransDonation(
  orderId: string,

  amount: number,

  userId: string,

  expiry: MidtransExpiry,
) {
  const transaction = await createTransaction({
    orderId,

    amount,

    options: {
      expiry,
    },
  });

  if (!transaction.token) {
    paymentLog(
      "MIDTRANS_CREATE_TRANSACTION_FAILED",

      transaction,

      {
        orderId,

        amount,

        userId,
      },
    );

    throw new Error("Failed to create Midtrans transaction.");
  }

  return transaction;
}