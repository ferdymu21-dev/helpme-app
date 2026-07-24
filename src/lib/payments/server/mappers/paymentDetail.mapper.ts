import type {
    TransactionDetail,
} from "@/features/payments/types/transactionDetail";

import {
    createPaymentDetail,
} from "@/lib/payments/shared/payment.factory";

interface PaymentRow {

    id: string;

    amount: number;

    payment_status: string;

    payment_method: string | null;

    midtrans_order_id: string;

    created_at: string;

    payment_type?: string | null;

    task_id?: string | null;

    tasks?:
    | {
        title: string;
    }[]
    | null;

}

export function mapPaymentDetail(
    payment: PaymentRow,
): TransactionDetail {

    const isTask =
        payment.payment_type === "URGENT_TASK";

    return createPaymentDetail({

        id: payment.id,

        type:
            isTask
                ? "URGENT_TASK"
                : "DONATION",

        title:
            isTask
                ? (
                    payment.tasks?.[0]?.title ??
                    "Layanan Prioritas"
                )
                : "Donasi HelpMe",

        amount: payment.amount,

        status:
            payment.payment_status as TransactionDetail["status"],

        orderId:
            payment.midtrans_order_id,

        paymentMethod:
            payment.payment_method,

        createdAt:
            payment.created_at,

        taskId:
            payment.task_id ?? null,

    });

}