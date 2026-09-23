import { PAYMENT_STATUS } from "../constants/payment";

import type { PaymentStatusValue } from "../constants/payment";

import {
  getMidtransTransactionStatus,
  expireMidtransTransaction,
} from "./midtrans.server";

import {
  getMidtransHttpStatusCode,
  parseMidtransStatusResponse,
} from "./midtransStatus.parser";

import { assertPaymentAmountMatches } from "./paymentAmount";

import { resolvePaymentStatus } from "./paymentStatus.mapper";

import { handleDonationPayment } from "./handlers/donation.handler";

import { handleUrgentTaskPayment } from "./handlers/urgent-task.handler";

import {
  handleServiceListingPayment,
} from "./handlers/service-listing.handler";

import type { MidtransStatusResponse } from "./midtrans.types";

import type { PaymentStatusSnapshot } from "./paymentStatus.repository";

interface ReconciliationPayload {
  orderId: string;

  paymentStatus: PaymentStatusValue;

  transactionId?: string;

  paymentMethod?: string;

  paidAt?: string;

  expiredAt?: string;
}

function normalizeTransactionId(
  value:
    | string
    | null
    | undefined,
): string | undefined {
  const normalized =
    value?.trim();

  return normalized
    ? normalized
    : undefined;
}

async function getMidtransStatusForReconciliation(
  snapshot:
    PaymentStatusSnapshot,
  orderId: string,
  transactionIdHint?: string,
): Promise<MidtransStatusResponse> {
  const transactionId =
    normalizeTransactionId(
      transactionIdHint,
    ) ??
    normalizeTransactionId(
      snapshot
        .midtransTransactionId,
    );

  /*
   * DANA / BI SNAP dapat memerlukan
   * transaction_id untuk Get Status.
   *
   * Browser hanya memberikan lookup
   * hint. Response authoritative tetap
   * berasal langsung dari Midtrans.
   */
  if (transactionId) {
    try {
      const rawStatus =
        await getMidtransTransactionStatus(
          transactionId,
        );

      const status =
        parseMidtransStatusResponse(
          rawStatus,
        );

      /*
       * Jangan menerima transaction_id
       * yang menunjuk order lain.
       */
      if (
        status.order_id !==
        orderId
      ) {
        throw new Error(
          "Order ID response Midtrans tidak sesuai.",
        );
      }

      return status;
    } catch (error) {
      /*
       * Lookup hint yang tidak ditemukan
       * tidak boleh mematikan fallback
       * order_id untuk metode pembayaran
       * lain.
       */
      if (
        getMidtransHttpStatusCode(
          error,
        ) !== 404
      ) {
        throw error;
      }
    }
  }

  const rawStatus =
    await getMidtransTransactionStatus(
      orderId,
    );

  return parseMidtransStatusResponse(
    rawStatus,
  );
}

async function dispatchPaymentStatus(
  paymentType: PaymentStatusSnapshot["paymentType"],

  payload: ReconciliationPayload,
) {
  switch (paymentType) {
    case "DONATION":
      await handleDonationPayment(payload);

      return;

    case "URGENT_TASK":
      await handleUrgentTaskPayment(payload);

      return;

    case "SERVICE_LISTING":
      await handleServiceListingPayment(
        payload,
      );

      return;
  }
}

async function applyMidtransStatus(
  snapshot: PaymentStatusSnapshot,

  orderId: string,

  response: MidtransStatusResponse,

  afterDeadline: boolean,
): Promise<boolean> {
  /*
   * Seluruh response Midtrans yang akan
   * mengubah payment HelpMe wajib
   * mengacu ke Order ID yang sama.
   */
  if (response.order_id !== orderId) {
    throw new Error("Order ID response Midtrans tidak sesuai.");
  }

  if (!response.gross_amount) {
    throw new Error("Response Midtrans tidak memiliki nominal pembayaran.");
  }

  assertPaymentAmountMatches(snapshot.amount, response.gross_amount);

  const paymentStatus = resolvePaymentStatus(
    response.transaction_status,

    response.fraud_status,

    {
      afterDeadline,
    },
  );

  if (paymentStatus === PAYMENT_STATUS.PENDING) {
    return false;
  }

  if (
    paymentStatus === PAYMENT_STATUS.PAID &&
    (!response.transaction_id || !response.payment_type)
  ) {
    throw new Error(
      "Status PAID Midtrans tidak memiliki data transaksi lengkap.",
    );
  }

  await dispatchPaymentStatus(
    snapshot.paymentType,

    {
      orderId,

      paymentStatus,

      transactionId: response.transaction_id,

      paymentMethod: response.payment_type,

      paidAt:
        paymentStatus === PAYMENT_STATUS.PAID
          ? response.settlement_time
          : undefined,

      expiredAt:
        paymentStatus === PAYMENT_STATUS.EXPIRED
          ? response.expiry_time
          : undefined,
    },
  );

  return true;
}

export async function reconcilePendingPayment(
  snapshot: PaymentStatusSnapshot,

  orderId: string,

  afterDeadline = false,

  transactionIdHint?: string,
) {
  const status =
    await getMidtransStatusForReconciliation(
      snapshot,
      orderId,
      transactionIdHint,
    );

  return await applyMidtransStatus(
    snapshot,

    orderId,

    status,

    afterDeadline,
  );
}

export async function reconcileExpiredPendingPayment(
  snapshot: PaymentStatusSnapshot,

  orderId: string,

  transactionIdHint?: string,
) {
  /*
   * STEP 1
   * Ambil authoritative status Midtrans.
   */
  let initialStatus: MidtransStatusResponse;

  try {
    initialStatus = await getMidtransStatusForReconciliation(
      snapshot,
      orderId,
      transactionIdHint,
    );
  } catch (error) {
    /*
     * Order ID berasal dari database
     * HelpMe sendiri dan deadline resmi
     * sudah terlewati.
     *
     * Bila Midtrans tidak memiliki
     * transaksi tersebut (404), berarti
     * tidak ada transaksi provider yang
     * masih bisa kita reconcile.
     *
     * Tutup checkout session HelpMe
     * sebagai EXPIRED.
     */
    if (getMidtransHttpStatusCode(error) === 404) {
      /*
       * Payment sudah melewati deadline
       * lokal dan Midtrans tidak lagi
       * mengenal transaksi tersebut.
       *
       * Tutup lifecycle HelpMe sebagai
       * EXPIRED menggunakan deadline resmi
       * payment sebagai waktu expiry.
       */
      await dispatchPaymentStatus(
        snapshot.paymentType,

        {
          orderId,

          paymentStatus: PAYMENT_STATUS.EXPIRED,

          expiredAt: snapshot.paymentExpiresAt ?? undefined,
        },
      );

      return;
    }

    throw error;
  }

  /*
   * Midtrans ternyata sudah terminal.
   */
  const initialTerminal = await applyMidtransStatus(
    snapshot,

    orderId,

    initialStatus,

    true,
  );

  if (initialTerminal) {
    return;
  }

  /*
   * STEP 2
   *
   * Midtrans masih PENDING / challenge.
   * Deadline HelpMe sudah lewat.
   *
   * Minta Midtrans sendiri menutup
   * transaksi, jangan set EXPIRED secara
   * lokal lebih dulu.
   */
  let expireResponse: unknown;

  try {
    expireResponse = await expireMidtransTransaction(orderId);
  } catch {
    /*
     * Bisa terjadi race:
     *
     * GET  → PENDING
     * user → berhasil bayar
     * expire() → 412
     *
     * Maka selalu GET status lagi.
     */
    await reconcilePendingPayment(
      snapshot,

      orderId,

      true,

      transactionIdHint,
    );

    return;
  }

  /*
   * Response Expire API biasanya sudah
   * berisi transaction_status=expire.
   *
   * Gunakan langsung bila valid.
   */
  try {
    const parsedExpireResponse = parseMidtransStatusResponse(expireResponse);

    const expireTerminal = await applyMidtransStatus(
      snapshot,

      orderId,

      parsedExpireResponse,

      true,
    );

    if (expireTerminal) {
      return;
    }
  } catch (error) {
    console.warn(
      "[Payment Reconciliation] Response expire Midtrans tidak dapat digunakan, melakukan status re-check.",

      error,
    );
  }

  /*
   * Final authoritative re-check.
   */
  await reconcilePendingPayment(
    snapshot,

    orderId,

    true,

    transactionIdHint,
  );
}
