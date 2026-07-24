export type PaymentResultStatus =

    | "IDLE"

    | "SUCCESS"

    | "PENDING"

    | "FAILED"

    | "EXPIRED"

    | "CANCELLED";

export interface PaymentResult {

    status: PaymentResultStatus;

    orderId: string;

    amount: number;

    paymentType?: string;

    taskId?: string | null;

}