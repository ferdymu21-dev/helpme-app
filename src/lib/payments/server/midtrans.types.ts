export interface MidtransNotification {

    order_id: string;

    transaction_id: string;

    transaction_status: string;

    fraud_status: string;

    payment_type: string;

    gross_amount: string;

    status_code: string;

    signature_key: string;

    settlement_time?: string;

    expiry_time?: string;

}