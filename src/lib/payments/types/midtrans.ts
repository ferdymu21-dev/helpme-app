export interface MidtransTransaction {

    transaction_details: {

        order_id: string;

        gross_amount: number;

    };

    enabled_payments?: string[];

    qris?: {

        acquirer?: string;

    };

    customer_details?: {

        first_name?: string;

        email?: string;

    };

}