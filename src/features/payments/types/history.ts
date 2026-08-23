import type {
    PaymentHistoryBase,
    PaymentType,
    PaymentStatus,
} from "@/lib/payments/shared/payment.types";

export type TransactionType = PaymentType;

export type TransactionStatus = PaymentStatus;

export type TransactionHistoryItem = PaymentHistoryBase;