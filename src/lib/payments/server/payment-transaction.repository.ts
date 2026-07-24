import {
    adminSupabase,
} from "@/lib/supabase/admin";

interface CreateTaskTransactionPayload {

    paymentId: string;

    orderId: string;

    paymentStatus: string;

    transactionId: string;

    paymentMethod: string;

    paidAt?: string;

    expiredAt?: string;

    userId: string;

    metadata: Record<string, unknown>;

}

export async function createTaskFromPaymentTransaction(

    payload: CreateTaskTransactionPayload

) {

    const { data, error, } =

    await adminSupabase.rpc(

        "create_task_from_payment_transaction",

        {

            p_payment_id:
                payload.paymentId,

            p_order_id:
                payload.orderId,

            p_payment_status:
                payload.paymentStatus,

            p_transaction_id:
                payload.transactionId,

            p_payment_method:
                payload.paymentMethod,

            p_paid_at:
                payload.paidAt ?? null,

            p_expired_at:
                payload.expiredAt ?? null,

            p_user_id:
                payload.userId,

            p_metadata:
                payload.metadata,

        }

    );

    if (error) {

        throw error;

    }

    return data;

}