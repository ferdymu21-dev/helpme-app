import "server-only";

import {
  listPendingPaymentCandidates,
} from "./paymentLifecycle.repository";

import {
  reconcileExpiredPendingPayment,
} from "./paymentReconciliation.service";

const PAYMENT_RECONCILIATION_BATCH_SIZE =
  50;

export interface PaymentLifecycleResult {
  scanned: number;

  processed: number;

  failed: number;
}

export async function runPaymentLifecycleService():
Promise<PaymentLifecycleResult> {
  const candidates =
    await listPendingPaymentCandidates(
      PAYMENT_RECONCILIATION_BATCH_SIZE,
    );

  let processed = 0;

  let failed = 0;

  for (
    const candidate of
    candidates
  ) {
    try {
      const expiresAt =
        candidate.snapshot
          .paymentExpiresAt
          ? Date.parse(
              candidate.snapshot
                .paymentExpiresAt,
            )
          : Number.NaN;

      const deadlinePassed =
        Number.isFinite(
          expiresAt,
        ) &&
        expiresAt <=
          Date.now();

      if (
        deadlinePassed
      ) {
        /*
         * Deadline HelpMe sudah lewat.
         *
         * Flow existing akan:
         *
         * GET Midtrans
         * → terminal? apply
         *
         * masih pending?
         * → expire melalui Midtrans
         * → reconcile lagi
         */
        await reconcileExpiredPendingPayment(
          candidate.snapshot,

          candidate.orderId,
        );
      } else {
        /*
         * Masih dalam payment window.
         *
         * Reconcile status provider agar
         * settlement/cancel/expire tetap
         * terdeteksi meskipun webhook
         * gagal.
         */
        await reconcileExpiredPendingPayment(
          candidate.snapshot,

          candidate.orderId,
        );
      }

      processed += 1;
    } catch (error) {
      failed += 1;

      console.error(
        "[Payment Lifecycle] Gagal reconcile payment.",

        {
          orderId:
            candidate.orderId,

          error,
        },
      );
    }
  }

  return {
    scanned:
      candidates.length,

    processed,

    failed,
  };
}