import type {
  PaymentDetailBase,
  PaymentStatus,
  PaymentType,
} from "@/lib/payments/shared/payment.types";

export type TransactionDetailType = PaymentType;

export type TransactionDetailStatus = PaymentStatus;

export type TransactionDetail = PaymentDetailBase;