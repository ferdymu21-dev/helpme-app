import {
  createTaskFromPaymentTransaction,
} from "../payment-transaction.repository";

import {
  findTaskPaymentByOrderId,
  claimTaskPayment,
  releaseTaskPayment,
} from "../payment.repository";

import {
  updateTaskPayment,
} from "../webhook.repository";

import {
  createNotificationServer,
} from "@/features/notifications/server";

import {
  NotificationFactory,
} from "@/features/notifications/factories";

import {
  PAYMENT_STATUS,
} from "../../constants/payment";

import type {
  PaymentStatusValue,
} from "../../constants/payment";

interface UrgentTaskHandlerPayload {
  orderId: string;

  paymentStatus:
    PaymentStatusValue;

  transactionId?: string;

  paymentMethod?: string;

  paidAt?: string;

  expiredAt?: string;
}

export async function handleUrgentTaskPayment(
  payload: UrgentTaskHandlerPayload,
) {
  const taskPayment =
    await findTaskPaymentByOrderId(
      payload.orderId,
    );

  if (!taskPayment) {
    throw new Error(
      "Task payment tidak ditemukan.",
    );
  }

  /*
   * Task sudah pernah berhasil dibuat.
   *
   * Jangan memproses webhook /
   * reconciliation berikutnya lagi.
   */
  if (taskPayment.task_id) {
    return;
  }

  /*
   * NON-PAID
   *
   * Gunakan conditional DB transition.
   * Tidak perlu memakai is_processing
   * karena UPDATE payment_status sendiri
   * menjadi atomic gate.
   */
  if (
    payload.paymentStatus !==
    PAYMENT_STATUS.PAID
  ) {
    const transition =
      await updateTaskPayment(
        payload,
      );

    if (!transition) {
      return;
    }

    switch (
      payload.paymentStatus
    ) {
      case PAYMENT_STATUS.EXPIRED:
        await createNotificationServer(
          NotificationFactory
            .urgentTaskExpired(
              transition.user_id,

              transition.id,
            ),
        );

        break;

      case PAYMENT_STATUS.FAILED:
        await createNotificationServer(
          NotificationFactory
            .urgentTaskFailed(
              transition.user_id,

              transition.id,
            ),
        );

        break;

      case PAYMENT_STATUS.CANCELLED:
        await createNotificationServer(
          NotificationFactory
            .urgentTaskCancelled(
              transition.user_id,

              transition.id,
            ),
        );

        break;

      default:
        break;
    }

    return;
  }

  /*
   * PAID
   *
   * Tetap gunakan mekanisme existing
   * claim + RPC karena flow ini juga
   * menciptakan Task dan harus tetap
   * exactly-once.
   */
  if (
    !payload.transactionId ||
    !payload.paymentMethod
  ) {
    throw new Error(
      "Data transaksi Midtrans untuk pembayaran berhasil tidak lengkap.",
    );
  }

  const claimed =
    await claimTaskPayment(
      taskPayment.id,
    );

  if (!claimed) {
    return;
  }

  try {
    const taskId =
      await createTaskFromPaymentTransaction(
        {
          paymentId:
            taskPayment.id,

          orderId:
            payload.orderId,

          paymentStatus:
            payload.paymentStatus,

          transactionId:
            payload.transactionId,

          paymentMethod:
            payload.paymentMethod,

          paidAt:
            payload.paidAt,

          expiredAt:
            payload.expiredAt,

          userId:
            taskPayment.user_id,

          metadata:
            taskPayment.metadata as Record<
              string,
              unknown
            >,
        },
      );

    if (taskId) {
      await createNotificationServer(
        NotificationFactory
          .urgentTaskPaid(
            taskPayment.user_id,

            taskId,
          ),
      );
    }
  } finally {
    await releaseTaskPayment(
      taskPayment.id,
    );
  }
}