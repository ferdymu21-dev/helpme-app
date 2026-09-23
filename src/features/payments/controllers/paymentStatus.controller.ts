import {
  fetchPaymentStatus,
} from "@/lib/payments/server/paymentStatus.service";

export async function paymentStatusController(
  userId: string,
  orderId: string,
  transactionId?: string,
) {
  return await fetchPaymentStatus(
    userId,
    orderId,
    transactionId,
  );
}