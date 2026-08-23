export interface SimulatorPayment {
  id: string;

  midtrans_order_id: string;

  payment_type: string;

  amount: number;

  payment_status: string;

  payment_method: string | null;

  created_at: string;
}

export type SimulatorTransactionType =
  | "DONATION"
  | "ESCROW"
  | "WITHDRAW"
  | "REFUND"
  | "PREMIUM";

export type SimulatorPaymentMethod =
  | "QRIS"
  | "GOPAY"
  | "SHOPEEPAY"
  | "BCA_VA"
  | "BNI_VA"
  | "BRI_VA";

export type SimulatorTransactionStatus =
  | "SETTLEMENT"
  | "PENDING"
  | "EXPIRE"
  | "CANCEL"
  | "DENY"
  | "FAILURE"
  | "CAPTURE";