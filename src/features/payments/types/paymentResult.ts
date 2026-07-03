export type PaymentResultStatus =

    | "IDLE"

    | "SUCCESS"

    | "PENDING"

    | "FAILED"

    | "EXPIRED";

export interface PaymentResult {

    status: PaymentResultStatus;

    orderId: string;

    amount: number;

}