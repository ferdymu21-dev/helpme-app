export type PendingPaymentType =
  | "DONATION"
  | "URGENT_TASK";

export interface PendingPaymentSummary {
  id: string;
  orderId: string;
  paymentType: PendingPaymentType;
  amount: number;
  createdAt: string;
  paymentExpiresAt: string;
}

export interface ResumePaymentData {
  orderId: string;
  paymentType: PendingPaymentType;
  amount: number;
  snapToken: string;
}