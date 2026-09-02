import "server-only";

import { paymentLog } from "@/lib/monitoring/payment.logger";

import { generateOrderId, PaymentType } from "./order";

import type { CreateDonationCommand, DonationResult } from "../types/donation";

import { validateDonationAmount } from "./donation.validator";

import { createMidtransDonation } from "./donation.midtrans";

import { saveDonation } from "./donation.repository";

import { buildDonationResponse } from "./donation.mapper";

import { createPaymentExpiry } from "./paymentExpiry";

export async function createDonation(
  payload: CreateDonationCommand,
): Promise<DonationResult> {
  validateDonationAmount(payload.amount);

  try {
    const orderId = generateOrderId(PaymentType.DONATION);

    const { paymentExpiresAt, midtransExpiry } = createPaymentExpiry();

    const transaction = await createMidtransDonation(
      orderId,

      payload.amount,

      payload.userId,

      midtransExpiry,
    );

    await saveDonation(
      payload,

      orderId,

      transaction,

      paymentExpiresAt,
    );

    return buildDonationResponse(
      orderId,

      transaction,
    );
  } catch (error) {
    paymentLog(
      "CREATE_DONATION_FAILED",

      error,

      {
        amount: payload.amount,

        userId: payload.userId,
      },
    );

    throw error;
  }
}