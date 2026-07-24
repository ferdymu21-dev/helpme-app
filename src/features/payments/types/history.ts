import type {
    PaymentHistoryBase,
    PaymentType,
    PaymentStatus,
} from "@/lib/payments/shared/payment.types";

export type TransactionType = PaymentType;

export type TransactionStatus = PaymentStatus;

export interface TransactionHistoryItem
    extends PaymentHistoryBase {}