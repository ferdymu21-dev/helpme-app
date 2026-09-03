import {
  PAYMENT_STATUS,
} from "../constants/payment";

import {
  getPaymentStatus,
} from "./paymentStatus.repository";

import {
  reconcileExpiredPendingPayment,
  reconcilePendingPayment,
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
   * Status lokal sudah terminal.
   *
   * Jangan melakukan provider request
   * berulang pada payment yang sudah
   * selesai direconcile.
   */
  if (
    current.status !==
    PAYMENT_STATUS.PENDING
  ) {
    return toPublicPaymentStatus(
      current,
    );
  }

  const expiresAt =
    current.paymentExpiresAt
      ? Date.parse(
          current.paymentExpiresAt,
        )
      : Number.NaN;

  const deadlinePassed =
    Number.isFinite(
      expiresAt,
    ) &&
    expiresAt <= Date.now();

  try {
    /*
     * PAYMENT MASIH AKTIF
     *
     * Midtrans tetap authoritative.
     *
     * Ini adalah fallback apabila
     * webhook terlambat atau tidak
     * berhasil sampai ke HelpMe.
     */
    if (!deadlinePassed) {
      await reconcilePendingPayment(
        current,

        orderId,
      );
    } else {
      /*
       * DEADLINE SUDAH LEWAT
       *
       * Gunakan flow existing:
       *
       * 1. GET Midtrans
       * 2. bila terminal → reconcile
       * 3. bila masih pending → expire
       *    melalui Midtrans
       * 4. reconcile kembali
       */
      await reconcileExpiredPendingPayment(
        current,

        orderId,
      );
    }
  } catch (error) {
    /*
     * Provider error tidak boleh
     * menyebabkan HelpMe menebak status.
     *
     * Pertahankan state lokal PENDING
     * dan coba kembali pada polling
     * berikutnya.
     */
    console.error(
      "[Payment Reconciliation]",

      error,
    );

    return toPublicPaymentStatus(
      current,
    );
  }

  /*
   * Reconciliation mungkin sudah
   * mengubah payment_status dan untuk
   * URGENT_TASK juga mungkin membuat
   * Task.
   *
   * Selalu baca DB kembali.
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