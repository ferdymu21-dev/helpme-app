import type { MidtransNotification } from "./midtrans.types";

export interface PaymentNotification {
  orderId: string;

  transactionId: string;

  status: string;

  fraudStatus?: string;

  paymentMethod: string;

  amount: number;

  settlementTime?: string;

  expiryTime?: string;
}

export function parseNotification(
  notification: MidtransNotification,
): PaymentNotification {
  return {
    orderId: notification.order_id,

    transactionId: notification.transaction_id,

    status: notification.transaction_status,

    fraudStatus: notification.fraud_status,

    paymentMethod: notification.payment_type,

    amount: Number(notification.gross_amount),

    settlementTime: notification.settlement_time,

    expiryTime: notification.expiry_time,
  };
}