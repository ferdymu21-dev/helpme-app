import {
  adminSupabase,
} from "@/lib/supabase/admin";

import {
  PAYMENT_STATUS,
} from "../constants/payment";

import type {
  PaymentStatusValue,
} from "../constants/payment";

interface PaymentUpdatePayload {
  orderId: string;

  paymentStatus:
    PaymentStatusValue;

  transactionId?: string;

  paymentMethod?: string;

  paidAt?: string;

  expiredAt?: string;
}

interface PaymentUpdateFields {
  payment_status:
    PaymentStatusValue;

  midtrans_transaction_id?: string;

  payment_method?: string;

  paid_at?: string;

  expired_at?: string;
}

function createPaymentUpdateFields(
  payload: PaymentUpdatePayload,
): PaymentUpdateFields {
  const updateFields:
    PaymentUpdateFields = {
      payment_status:
        payload.paymentStatus,
    };

  if (
    payload.transactionId !==
    undefined
  ) {
    updateFields
      .midtrans_transaction_id =
      payload.transactionId;
  }

  if (
    payload.paymentMethod !==
    undefined
  ) {
    updateFields.payment_method =
      payload.paymentMethod;
  }

  if (
    payload.paidAt !==
    undefined
  ) {
    updateFields.paid_at =
      payload.paidAt;
  }

  if (
    payload.expiredAt !==
    undefined
  ) {
    updateFields.expired_at =
      payload.expiredAt;
  }

  return updateFields;
}

export async function updateDonationPayment(
  payload: PaymentUpdatePayload,
) {
  const baseQuery =
    adminSupabase
      .from(
        "support_donations",
      )
      .update(
        createPaymentUpdateFields(
          payload,
        ),
      )
      .eq(
        "midtrans_order_id",
        payload.orderId,
      );

  /*
   * PAID memiliki prioritas tertinggi.
   *
   * Jika authoritative Midtrans kemudian
   * membuktikan pembayaran berhasil,
   * PAID boleh mengoreksi EXPIRED,
   * FAILED, atau CANCELLED.
   *
   * Duplicate PAID tidak diproses lagi.
   */
  const transitionQuery =
    payload.paymentStatus ===
    PAYMENT_STATUS.PAID
      ? baseQuery.neq(
          "payment_status",
          PAYMENT_STATUS.PAID,
        )
      : baseQuery.eq(
          "payment_status",
          PAYMENT_STATUS.PENDING,
        );

  const {
    data,
    error,
  } =
    await transitionQuery
      .select(`
        id,
        user_id,
        payment_status
      `)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTaskPayment(
  payload: PaymentUpdatePayload,
) {
  const baseQuery =
    adminSupabase
      .from(
        "task_payments",
      )
      .update(
        createPaymentUpdateFields(
          payload,
        ),
      )
      .eq(
        "midtrans_order_id",
        payload.orderId,
      );

  const transitionQuery =
    payload.paymentStatus ===
    PAYMENT_STATUS.PAID
      ? baseQuery.neq(
          "payment_status",
          PAYMENT_STATUS.PAID,
        )
      : baseQuery.eq(
          "payment_status",
          PAYMENT_STATUS.PENDING,
        );

  const {
    data,
    error,
  } =
    await transitionQuery
      .select(`
        id,
        user_id,
        payment_status,
        task_id
      `)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}