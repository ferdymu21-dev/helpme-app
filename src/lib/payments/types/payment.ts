export type PaymentStatus =

    | "PENDING"

    | "PAID"

    | "FAILED"

    | "EXPIRED"

    | "CANCELLED";

export type PaymentMethod =

    | "QRIS";

export interface Donation {

    id: string;

    user_id: string;

    amount: number;

    payment_status: PaymentStatus;

    payment_method: PaymentMethod | null;

    midtrans_order_id: string | null;

    midtrans_transaction_id: string | null;

    snap_token: string | null;

    payment_url: string | null;

    qr_url: string | null;

    expired_at: string | null;

    paid_at: string | null;

    created_at: string;

}

/*
|--------------------------------------------------------------------------
| API RESPONSE
|--------------------------------------------------------------------------
*/

export interface DonationPaymentResponse {

    orderId: string;

    snapToken: string;

    redirectUrl?: string;

}