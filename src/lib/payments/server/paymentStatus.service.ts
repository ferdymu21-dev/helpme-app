import {
  PAYMENT_STATUS,
} from "../constants/payment";

import {
  getPaymentStatus,
} from "./paymentStatus.repository";

import {
  reconcileExpiredPendingPayment,
} from "./paymentReconciliation.service";

import type {
  PaymentStatusSnapshot,
} from "./paymentStatus.repository";

function toPublicPaymentStatus(
  snapshot:
    PaymentStatusSnapshot,
) {
  if (
    snapshot.paymentType ===
    "URGENT_TASK"
  ) {
    return {
      paymentType:
        "URGENT_TASK" as const,

      status:
        snapshot.status,

      taskId:
        snapshot.taskId,
    };
  }

  return {
    paymentType:
      "DONATION" as const,

    status:
      snapshot.status,
  };
}

export async function fetchPaymentStatus(
  userId: string,

  orderId: string,
) {
  const current =
    await getPaymentStatus(
      userId,

      orderId,
    );

  /*
   * Sudah terminal.
   * Tidak perlu Midtrans request.
   */
  if (
    current.status !==
    PAYMENT_STATUS.PENDING
  ) {
    return toPublicPaymentStatus(
      current,
    );
  }

  /*
   * Legacy payment tanpa deadline
   * tidak direconcile otomatis.
   */
  if (
    !current.paymentExpiresAt
  ) {
    return toPublicPaymentStatus(
      current,
    );
  }

  const expiresAt =
    Date.parse(
      current.paymentExpiresAt,
    );

  if (
    Number.isNaN(
      expiresAt,
    ) ||
    expiresAt > Date.now()
  ) {
    return toPublicPaymentStatus(
      current,
    );
  }

  /*
   * Deadline sudah lewat.
   *
   * Midtrans menjadi authoritative
   * reconciliation source.
   *
   * Error provider tidak boleh membuat
   * kita menebak terminal status.
   * Biarkan PENDING dan polling berikutnya
   * akan mencoba lagi.
   */
  try {
    await reconcileExpiredPendingPayment(
      current,

      orderId,
    );
  } catch (error) {
    console.error(
      "[Payment Reconciliation]",

      error,
    );

    return toPublicPaymentStatus(
      current,
    );
  }

  /*
   * Handler reconciliation mungkin
   * mengubah DB sekaligus menciptakan
   * Task untuk Urgent PAID.
   *
   * Selalu baca state terbaru.
   */
  const reconciled =
    await getPaymentStatus(
      userId,

      orderId,
    );

  return toPublicPaymentStatus(
    reconciled,
  );
}