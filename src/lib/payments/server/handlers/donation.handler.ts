import {
  updateDonationPayment,
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

interface DonationHandlerPayload {
  orderId: string;

  paymentStatus:
    PaymentStatusValue;

  transactionId?: string;

  paymentMethod?: string;

  paidAt?: string;

  expiredAt?: string;
}

export async function handleDonationPayment(
  payload: DonationHandlerPayload,
) {
  const transition =
    await updateDonationPayment(
      payload,
    );

  /*
   * Tidak ada row yang berubah berarti:
   *
   * - duplicate webhook
   * - duplicate reconciliation
   * - terminal status mencoba menimpa
   *   terminal status lain
   *
   * Maka notification juga tidak
   * boleh dibuat ulang.
   */
  if (!transition) {
    return;
  }

  switch (
    payload.paymentStatus
  ) {
    case PAYMENT_STATUS.PAID:
      await createNotificationServer(
        NotificationFactory
          .donationPaid(
            transition.user_id,
          ),
      );

      break;

    case PAYMENT_STATUS.EXPIRED:
      await createNotificationServer(
        NotificationFactory
          .donationExpired(
            transition.user_id,

            transition.id,
          ),
      );

      break;

    case PAYMENT_STATUS.FAILED:
      await createNotificationServer(
        NotificationFactory
          .donationFailed(
            transition.user_id,

            transition.id,
          ),
      );

      break;

    case PAYMENT_STATUS.CANCELLED:
      await createNotificationServer(
        NotificationFactory
          .donationCancelled(
            transition.user_id,

            transition.id,
          ),
      );

      break;

    default:
      break;
  }
}