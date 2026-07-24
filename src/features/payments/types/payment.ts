export type PaymentType =
  | "DONATION"
  | "URGENT_TASK"
  | "BOOST_TASK"
  | "FEATURED_TASK"
  | "TASK_PROMOTION"
  | "ESCROW"
  | "WITHDRAW"
  | "WALLET";

export interface CreatePaymentPayload {
  paymentType: PaymentType;

  amount: number;

  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {

  orderId: string;

  snapToken: string;

  redirectUrl: string;

}