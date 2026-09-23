import {
  adminSupabase,
} from "@/lib/supabase/admin";

export interface PaymentStatusSnapshot {
  paymentType:
    | "DONATION"
    | "URGENT_TASK"
    | "SERVICE_LISTING";

  status: string;

  amount: number;

  paymentExpiresAt:
    string | null;

  midtransTransactionId:
    string | null;

  taskId?: string | null;

  serviceListingId?:
    string | null;
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
        amount,
        payment_expires_at,
        midtrans_transaction_id
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

       amount:
        donation.amount,

      paymentExpiresAt:
        donation.payment_expires_at,

      midtransTransactionId:
        donation
          .midtrans_transaction_id,
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
        amount,
        payment_expires_at,
        midtrans_transaction_id,
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

      amount:
        taskPayment.amount,

      paymentExpiresAt:
        taskPayment
          .payment_expires_at,

      midtransTransactionId:
        taskPayment
          .midtrans_transaction_id,

      taskId:
        taskPayment.task_id,
    };
  }

    /*
  |---------------------------------------
  | SERVICE LISTING
  |---------------------------------------
  */

  const {
    data:
      serviceListingPayment,

    error:
      serviceListingPaymentError,
  } =
    await adminSupabase
      .from(
        "service_listing_payments",
      )
      .select(`
        payment_status,
        amount,
        payment_expires_at,
        midtrans_transaction_id,
        service_listing_id
      `)
      .eq(
        "midtrans_order_id",
        orderId,
      )
      .eq(
        "provider_id",
        userId,
      )
      .maybeSingle();

  if (
    serviceListingPaymentError
  ) {
    throw serviceListingPaymentError;
  }

  if (
    serviceListingPayment
  ) {
    return {
      paymentType:
        "SERVICE_LISTING",

      status:
        serviceListingPayment
          .payment_status,

      amount:
        serviceListingPayment
          .amount,

      paymentExpiresAt:
        serviceListingPayment
          .payment_expires_at,

      midtransTransactionId:
        serviceListingPayment
          .midtrans_transaction_id,

      serviceListingId:
        serviceListingPayment
          .service_listing_id,
    };
  }

  throw new Error(
    "Payment tidak ditemukan.",
  );
}