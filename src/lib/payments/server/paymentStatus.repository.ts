import {
  adminSupabase,
} from "@/lib/supabase/admin";

export interface PaymentStatusSnapshot {
  paymentType:
    | "DONATION"
    | "URGENT_TASK";

  status: string;

  paymentExpiresAt:
    string | null;

  taskId?: string | null;
}

export async function getPaymentStatus(
  userId: string,

  orderId: string,
): Promise<PaymentStatusSnapshot> {
  /*
  |---------------------------------------
  | DONATION
  |---------------------------------------
  */

  const {
    data: donation,
    error: donationError,
  } =
    await adminSupabase
      .from(
        "support_donations",
      )
      .select(`
        payment_status,
        payment_expires_at
      `)
      .eq(
        "midtrans_order_id",
        orderId,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle();

  if (donationError) {
    throw donationError;
  }

  if (donation) {
    return {
      paymentType:
        "DONATION",

      status:
        donation.payment_status,

      paymentExpiresAt:
        donation.payment_expires_at,
    };
  }

  /*
  |---------------------------------------
  | URGENT TASK
  |---------------------------------------
  */

  const {
    data: taskPayment,
    error: taskPaymentError,
  } =
    await adminSupabase
      .from(
        "task_payments",
      )
      .select(`
        payment_status,
        payment_expires_at,
        task_id
      `)
      .eq(
        "midtrans_order_id",
        orderId,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle();

  if (taskPaymentError) {
    throw taskPaymentError;
  }

  if (taskPayment) {
    return {
      paymentType:
        "URGENT_TASK",

      status:
        taskPayment.payment_status,

      paymentExpiresAt:
        taskPayment
          .payment_expires_at,

      taskId:
        taskPayment.task_id,
    };
  }

  throw new Error(
    "Payment tidak ditemukan.",
  );
}