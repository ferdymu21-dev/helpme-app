import {
  adminSupabase,
} from "@/lib/supabase/admin";

export type PendingPaymentType =
  | "DONATION"
  | "URGENT_TASK";

export interface PendingPaymentSummary {
  id: string;

  orderId: string;

  paymentType:
    PendingPaymentType;

  amount: number;

  createdAt: string;

  paymentExpiresAt: string;
}

export interface ResumablePayment {
  orderId: string;

  paymentType:
    PendingPaymentType;

  amount: number;

  snapToken: string | null;
}

export async function getLatestPendingPayment(
  userId: string,
): Promise<PendingPaymentSummary | null> {
  const nowIso =
    new Date().toISOString();

  /*
   * Hanya transaksi yang:
   *
   * 1. masih PENDING
   * 2. memiliki deadline resmi
   * 3. deadline belum lewat
   *
   * Transaksi legacy dengan
   * payment_expires_at = NULL
   * sengaja tidak dianggap resumable.
   */
  const {
    data: donation,
    error: donationError,
  } = await adminSupabase
    .from("support_donations")
    .select(`
      id,
      amount,
      midtrans_order_id,
      created_at,
      payment_expires_at
    `)
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "payment_status",
      "PENDING",
    )
    .not(
      "payment_expires_at",
      "is",
      null,
    )
    .gt(
      "payment_expires_at",
      nowIso,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (donationError) {
    throw donationError;
  }

  const {
    data: taskPayment,
    error: taskPaymentError,
  } = await adminSupabase
    .from("task_payments")
    .select(`
      id,
      amount,
      midtrans_order_id,
      created_at,
      payment_expires_at
    `)
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "payment_status",
      "PENDING",
    )
    .not(
      "payment_expires_at",
      "is",
      null,
    )
    .gt(
      "payment_expires_at",
      nowIso,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (taskPaymentError) {
    throw taskPaymentError;
  }

  const donationSummary:
    PendingPaymentSummary | null =
    donation &&
    typeof donation.payment_expires_at ===
      "string"
      ? {
          id:
            donation.id,

          orderId:
            donation.midtrans_order_id,

          paymentType:
            "DONATION",

          amount:
            Number(
              donation.amount,
            ),

          createdAt:
            donation.created_at,

          paymentExpiresAt:
            donation.payment_expires_at,
        }
      : null;

  const taskSummary:
    PendingPaymentSummary | null =
    taskPayment &&
    typeof taskPayment.payment_expires_at ===
      "string"
      ? {
          id:
            taskPayment.id,

          orderId:
            taskPayment.midtrans_order_id,

          paymentType:
            "URGENT_TASK",

          amount:
            Number(
              taskPayment.amount,
            ),

          createdAt:
            taskPayment.created_at,

          paymentExpiresAt:
            taskPayment.payment_expires_at,
        }
      : null;

  if (
    !donationSummary &&
    !taskSummary
  ) {
    return null;
  }

  if (!donationSummary) {
    return taskSummary;
  }

  if (!taskSummary) {
    return donationSummary;
  }

  return Date.parse(
    taskSummary.createdAt,
  ) >
    Date.parse(
      donationSummary.createdAt,
    )
    ? taskSummary
    : donationSummary;
}

export async function getResumablePayment(
  userId: string,
  orderId: string,
): Promise<ResumablePayment | null> {
  const nowIso =
    new Date().toISOString();

  /*
   * Authorization + lifecycle gate:
   *
   * - harus milik current user
   * - harus PENDING
   * - harus punya deadline
   * - deadline belum lewat
   */
  const {
    data: donation,
    error: donationError,
  } = await adminSupabase
    .from("support_donations")
    .select(`
      amount,
      snap_token
    `)
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "midtrans_order_id",
      orderId,
    )
    .eq(
      "payment_status",
      "PENDING",
    )
    .not(
      "payment_expires_at",
      "is",
      null,
    )
    .gt(
      "payment_expires_at",
      nowIso,
    )
    .maybeSingle();

  if (donationError) {
    throw donationError;
  }

  if (donation) {
    return {
      orderId,

      paymentType:
        "DONATION",

      amount:
        Number(
          donation.amount,
        ),

      snapToken:
        donation.snap_token,
    };
  }

  const {
    data: taskPayment,
    error: taskPaymentError,
  } = await adminSupabase
    .from("task_payments")
    .select(`
      amount,
      snap_token
    `)
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "midtrans_order_id",
      orderId,
    )
    .eq(
      "payment_status",
      "PENDING",
    )
    .not(
      "payment_expires_at",
      "is",
      null,
    )
    .gt(
      "payment_expires_at",
      nowIso,
    )
    .maybeSingle();

  if (taskPaymentError) {
    throw taskPaymentError;
  }

  if (taskPayment) {
    return {
      orderId,

      paymentType:
        "URGENT_TASK",

      amount:
        Number(
          taskPayment.amount,
        ),

      snapToken:
        taskPayment.snap_token,
    };
  }

  return null;
}