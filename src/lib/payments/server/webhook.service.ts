import type { MidtransNotification } from "./midtrans.types";

import { verifySignature } from "./verifySignature";

import { handlePaymentNotification } from "./paymentNotification.service";

export async function processWebhook(notification: MidtransNotification) {
  const valid = verifySignature({
    orderId: notification.order_id,
    statusCode: notification.status_code,
    grossAmount: notification.gross_amount,
    signatureKey: notification.signature_key,
  });

  if (!valid) {
    throw new Error("Invalid Midtrans signature.");
  }

  return await handlePaymentNotification(notification);
}