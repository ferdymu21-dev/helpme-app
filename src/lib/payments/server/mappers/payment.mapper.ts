import type {
    TransactionHistoryItem,
} from "@/features/payments/types/history";

import {
    createPaymentHistory,
} from "@/lib/payments/shared/payment.factory";

interface PaymentHistoryRow {

    id: string;

    amount: number;

    payment_status: string;

    payment_method: string | null;

    midtrans_order_id: string;

    created_at: string;

    payment_type?: string | null;

    tasks?:
    | {
        title: string;
    }[]
    | null;

}

export function mapPaymentHistory(

    payment: PaymentHistoryRow,

): TransactionHistoryItem {

    const isUrgentTask =
        payment.payment_type === "URGENT_TASK";

    return createPaymentHistory({

        id:
            payment.id,

        type:
            (
                payment.payment_type ??
                "DONATION"
            ) as TransactionHistoryItem["type"],

        title:
            isUrgentTask
                ? (
                    payment.tasks?.[0]?.title ??
                    "Layanan Prioritas"
                )
                : "Donasi HelpMe",

        amount:
            payment.amount,

        status:
            payment.payment_status as TransactionHistoryItem["status"],

        orderId:
            payment.midtrans_order_id,

        paymentMethod:
            payment.payment_method,

        createdAt:
            payment.created_at,

    });

}