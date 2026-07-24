import type {
  PaymentType,
} from "./payment";

export type TransactionType =
  | PaymentType
  | "REFUND";
  
export type TransactionStatus =

    | "PENDING"

    | "PAID"

    | "FAILED"

    | "EXPIRED"

    | "CANCELLED";

export interface Transaction {

    id: string;

    type: TransactionType;

    title: string;

    amount: number;

    status: TransactionStatus;

    orderId: string;

    createdAt: string;

}