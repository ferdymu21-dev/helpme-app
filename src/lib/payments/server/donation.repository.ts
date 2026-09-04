import { adminSupabase } from "@/lib/supabase/admin";

import { paymentLog } from "@/lib/monitoring/payment.logger";

import { PAYMENT_STATUS } from "../constants/payment";

import type { CreateDonationCommand } from "../types/donation";

export async function saveDonation(
  payload: CreateDonationCommand,

  orderId: string,

  transaction: {
    token: string;

    redirect_url: string;
  },

  paymentExpiresAt: string,
) {
  const { error } = await adminSupabase

    .from("support_donations")

    .insert({
      user_id: payload.userId,

      amount: payload.amount,

      payment_status: PAYMENT_STATUS.PENDING,

      payment_method: null,

      midtrans_order_id: orderId,

      snap_token: transaction.token,

      payment_url: transaction.redirect_url,

      payment_expires_at: paymentExpiresAt,
    });

  if (error) {
    paymentLog(
      "DATABASE_INSERT_FAILED",

      error,

      {
        orderId,

        amount: payload.amount,

        userId: payload.userId,
      },
    );

    throw error;
  }
}