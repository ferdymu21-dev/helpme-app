import "server-only";

import {
    PaymentType,
    generateOrderId,
} from "./order";

import {
    createTransaction,
} from "./createTransaction";

import {
    saveUrgentTaskPayment,
} from "./urgentTask.repository";

import {
    buildUrgentTaskResponse,
} from "./urgentTask.mapper";

interface Payload {

    userId: string;

    amount: number;

    metadata?: Record<string, unknown>;

}

export async function createUrgentTaskPayment(

    payload: Payload

) {

    const orderId = generateOrderId(

        PaymentType.URGENT_TASK

    );

    const transaction = await createTransaction({

        orderId,

        amount: payload.amount,

    });

    await saveUrgentTaskPayment(

        payload,

        orderId,

        transaction,

    );

    return buildUrgentTaskResponse(

        orderId,

        transaction,

    );

}