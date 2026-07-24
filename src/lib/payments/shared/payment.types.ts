export type PaymentType =

    | "DONATION"
    | "URGENT_TASK"
    | "TOPUP"
    | "WITHDRAW"
    | "ESCROW"
    | "REFUND";

export type PaymentStatus =

    | "PENDING"
    | "PAID"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED";

export interface BasePayment {

    id: string;

    type: PaymentType;

    amount: number;

    status: PaymentStatus;

    orderId: string;

    paymentMethod: string | null;

    createdAt: string;

}

export interface PaymentHistoryBase
    extends BasePayment {

    title: string;

}

export interface PaymentDetailBase
    extends PaymentHistoryBase {

    /**
     * hanya dimiliki transaksi tertentu
     * misalnya pembayaran Urgent Task
     */
    taskId?: string | null;

}