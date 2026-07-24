import type {
    TransactionHistoryItem,
} from "@/features/payments/types/history";

import {
    createPaymentHistory,
} from "@/lib/payments/shared/payment.factory";

export function mapDonationToTransaction(

    donation: {

        id: string;

        amount: number;

        payment_status: string;

        created_at: string;

        midtrans_order_id: string;

    }

): TransactionHistoryItem {

    return createPaymentHistory({

        id: donation.id,

        type: "DONATION",

        title: "Donasi HelpMe",

        amount: donation.amount,

        status:

            donation.payment_status as TransactionHistoryItem["status"],

        orderId:

            donation.midtrans_order_id,

        paymentMethod: null,

        createdAt:

            donation.created_at,

    });

}