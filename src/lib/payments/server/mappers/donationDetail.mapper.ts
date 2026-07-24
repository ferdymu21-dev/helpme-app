import type {
    TransactionDetail,
} from "@/features/payments/types/transactionDetail";

import {
    createPaymentDetail,
} from "@/lib/payments/shared/payment.factory";

interface DonationRow {

    id: string;

    amount: number;

    payment_status: string;

    payment_method: string | null;

    midtrans_order_id: string;

    created_at: string;

}

export function mapDonationToTransactionDetail(

    donation: DonationRow,

): TransactionDetail {

    return createPaymentDetail({

        id: donation.id,

        type: "DONATION",

        title: "Donasi HelpMe",

        amount: donation.amount,

        status:

            donation.payment_status as TransactionDetail["status"],

        orderId:

            donation.midtrans_order_id,

        paymentMethod:

            donation.payment_method,

        createdAt:

            donation.created_at,

    });

}