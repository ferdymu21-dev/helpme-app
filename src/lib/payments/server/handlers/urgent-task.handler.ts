import {
    createTaskFromPaymentTransaction,
} from "../payment-transaction.repository";

import {
    findTaskPaymentByOrderId,
    claimTaskPayment,
    releaseTaskPayment,
} from "../payment.repository";

import {
    updateTaskPayment,
} from "../webhook.repository";

import {
    createNotificationServer,
} from "@/features/notifications/server";

import {
    NotificationFactory,
} from "@/features/notifications/factories";

interface UrgentTaskHandlerPayload {

    orderId: string;

    paymentStatus: string;

    transactionId: string;

    paymentMethod: string;

    paidAt?: string;

    expiredAt?: string;

}

export async function handleUrgentTaskPayment(

    payload: UrgentTaskHandlerPayload

) {

    const taskPayment =

        await findTaskPaymentByOrderId(

            payload.orderId

        );

    if (!taskPayment) {

        throw new Error(

            "Task payment tidak ditemukan."

        );

    }

    if (

        taskPayment.task_id

    ) {

        console.log(
            "[TASK ALREADY CREATED]"
        );

        return;

    }

    const claimed = await claimTaskPayment(
        taskPayment.id
    );

    if (!claimed) {

        console.log(
            "[PAYMENT ALREADY PROCESSING]"
        );

        return;

    }

    try {

        if (payload.paymentStatus !== "PAID") {

            await updateTaskPayment({

                orderId:
                    payload.orderId,

                paymentStatus:
                    payload.paymentStatus,

                transactionId:
                    payload.transactionId,

                paymentMethod:
                    payload.paymentMethod,

                paidAt:
                    payload.paidAt,

                expiredAt:
                    payload.expiredAt,

            });

            if (

                payload.paymentStatus === "EXPIRED"

            ) {

                await createNotificationServer(

                    NotificationFactory.urgentTaskExpired(

                        taskPayment.user_id

                    )

                );

            }

            return;

        }

        console.log("[URGENT TASK] BEFORE RPC");

        const taskId =

            await createTaskFromPaymentTransaction({

                paymentId:
                    taskPayment.id,

                orderId:
                    payload.orderId,

                paymentStatus:
                    payload.paymentStatus,

                transactionId:
                    payload.transactionId,

                paymentMethod:
                    payload.paymentMethod,

                paidAt:
                    payload.paidAt,

                expiredAt:
                    payload.expiredAt,

                userId:
                    taskPayment.user_id,

                metadata:
                    taskPayment.metadata as Record<string, unknown>,

            });

        if (taskId) {

            await createNotificationServer(

                NotificationFactory.urgentTaskPaid(

                    taskPayment.user_id,

                    taskId

                )

            );

        }

        console.log("[URGENT TASK] AFTER RPC");

        console.log(
            "[TASK CREATED FROM PAYMENT]"
        );

    }
    finally {

        await releaseTaskPayment(
            taskPayment.id
        );

    }

}