import {
    createSnapTransaction,
} from "./midtrans.server";

interface CreateTransactionPayload {

    orderId: string;

    amount: number;

    options?: {

        enabled_payments?: string[];

    };

}

export async function createTransaction(

    payload: CreateTransactionPayload

) {

    const transaction =

        await createSnapTransaction({

            transaction_details: {

                order_id: payload.orderId,

                gross_amount: payload.amount,

            },

            ...(payload.options ?? {}),

        });

    return transaction;

}