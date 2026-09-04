import { adminSupabase } from "@/lib/supabase/admin";

import { PAYMENT_STATUS } from "../constants/payment";

interface Payload {
  userId: string;

  amount: number;

  metadata?: Record<string, unknown>;
}

export async function saveUrgentTaskPayment(
  payload: Payload,

  orderId: string,

  transaction: {
    token: string;

    redirect_url: string;
  },

  paymentExpiresAt: string,
) {
  const { error } = await adminSupabase

    .from("task_payments")

    .insert({
      user_id: payload.userId,

      payment_type: "URGENT_TASK",

      amount: payload.amount,

      payment_status: PAYMENT_STATUS.PENDING,

      payment_method: null,

      midtrans_order_id: orderId,

      snap_token: transaction.token,

      payment_url: transaction.redirect_url,

      payment_expires_at: paymentExpiresAt,

      metadata: payload.metadata ?? {},
    });

  if (error) {
    throw error;
  }
}