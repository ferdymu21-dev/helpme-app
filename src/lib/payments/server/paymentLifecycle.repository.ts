import "server-only";

import {
  adminSupabase,
} from "@/lib/supabase/admin";

import type {
  PaymentStatusSnapshot,
} from "./paymentStatus.repository";

export interface PendingPaymentCandidate {
  orderId: string;

  createdAt: string;

  snapshot:
    PaymentStatusSnapshot;
}

const SOURCE_FETCH_LIMIT = 100;

export async function listPendingPaymentCandidates(
  limit = 50,
): Promise<
  PendingPaymentCandidate[]
> {
  const nowIso =
    new Date().toISOString();

  /*
   * Hanya payment lifecycle baru yang
   * memiliki payment_expires_at.
   *
   * Payment legacy tanpa deadline
   * tidak boleh ditebak expiry-nya.
   */
  const {
    data: donations,
    error: donationsError,
  } =
    await adminSupabase
      .from(
        "support_donations",
      )
      .select(`
        midtrans_order_id,
        payment_status,
        payment_expires_at,
        created_at
      `)
      .eq(
        "payment_status",
        "PENDING",
      )
      .not(
        "midtrans_order_id",
        "is",
        null,
      )
      .not(
        "payment_expires_at",
        "is",
        null,
      )
      .lte(
        "payment_expires_at",
         nowIso,
      )
      .order(
        "payment_expires_at",
        {
          ascending: true,
        },
      )
      .limit(
        SOURCE_FETCH_LIMIT,
      );

  if (donationsError) {
    throw donationsError;
  }

  const {
    data: taskPayments,
    error: taskPaymentsError,
  } =
    await adminSupabase
      .from(
        "task_payments",
      )
      .select(`
        midtrans_order_id,
        payment_status,
        payment_expires_at,
        task_id,
        created_at
      `)
      .eq(
        "payment_status",
        "PENDING",
      )
      .not(
        "payment_expires_at",
        "is",
        null,
      )
      .lte(
        "payment_expires_at",
         nowIso,
      )
      .order(
        "payment_expires_at",
        {
          ascending: true,
        },
      )
      .limit(
        SOURCE_FETCH_LIMIT,
      );

  if (taskPaymentsError) {
    throw taskPaymentsError;
  }

  const candidates:
    PendingPaymentCandidate[] = [];

  for (
    const donation of
    donations ?? []
  ) {
    if (
      typeof donation
        .midtrans_order_id !==
        "string" ||
      typeof donation
        .payment_expires_at !==
        "string"
    ) {
      continue;
    }

    candidates.push({
      orderId:
        donation
          .midtrans_order_id,

      createdAt:
        donation.created_at,

      snapshot: {
        paymentType:
          "DONATION",

        status:
          donation
            .payment_status,

        paymentExpiresAt:
          donation
            .payment_expires_at,
      },
    });
  }

  for (
    const payment of
    taskPayments ?? []
  ) {
    if (
      typeof payment
        .midtrans_order_id !==
        "string" ||
      typeof payment
        .payment_expires_at !==
        "string"
    ) {
      continue;
    }

    candidates.push({
      orderId:
        payment
          .midtrans_order_id,

      createdAt:
        payment.created_at,

      snapshot: {
        paymentType:
          "URGENT_TASK",

        status:
          payment
            .payment_status,

        paymentExpiresAt:
          payment
            .payment_expires_at,

        taskId:
          payment.task_id,
      },
    });
  }

  /*
   * Prioritaskan payment yang deadline
   * paling dekat / sudah paling lama
   * melewati deadline.
   */
  candidates.sort(
    (left, right) => {
      const leftExpiry =
        left.snapshot
          .paymentExpiresAt
          ? Date.parse(
              left.snapshot
                .paymentExpiresAt,
            )
          : Date.parse(
              nowIso,
            );

      const rightExpiry =
        right.snapshot
          .paymentExpiresAt
          ? Date.parse(
              right.snapshot
                .paymentExpiresAt,
            )
          : Date.parse(
              nowIso,
            );

      return (
        leftExpiry -
        rightExpiry
      );
    },
  );

  return candidates.slice(
    0,
    Math.max(
      1,
      Math.min(
        limit,
        100,
      ),
    ),
  );
}