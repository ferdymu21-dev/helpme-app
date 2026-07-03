import {
    paymentLog,
} from "@/lib/monitoring/payment.logger";

import {
    createTransaction,
} from "./createTransaction";

export async function createMidtransDonation(

    orderId: string,

    amount: number,

    userId: string

) {
    const transaction =

    await createTransaction({

        orderId,

        amount,

    });

    if (!transaction.token) {

        paymentLog(

            "MIDTRANS_CREATE_TRANSACTION_FAILED",

            transaction,

            {

                orderId,

                amount,

                userId,

            }

        );

        throw new Error(

            "Failed to create Midtrans transaction."

        );

    }

    return transaction;

}