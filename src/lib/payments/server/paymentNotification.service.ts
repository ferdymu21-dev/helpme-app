import {
    parseNotification,
} from "./notification.parser";

import {
    resolvePaymentStatus,
} from "./paymentStatus.mapper";

import {
    findPaymentByOrderId,
} from "./payment.repository";

import type {
    MidtransNotification,
} from "./midtrans.types";

import {
    handleDonationPayment,
} from "./handlers/donation.handler";

import {
    handleUrgentTaskPayment,
} from "./handlers/urgent-task.handler";

export async function handlePaymentNotification(

    notification: MidtransNotification

) {

    const payment =

        parseNotification(

            notification

        );

    const paymentRecord =
        await findPaymentByOrderId(
            payment.orderId
        );

    if (!paymentRecord) {

        throw new Error(

            "Payment tidak ditemukan."

        );

    }

    const paymentStatus =

        resolvePaymentStatus(

            payment.status

        );

    switch (

    paymentRecord.paymentType

    ) {

        case "DONATION":

            await handleDonationPayment({

                orderId:

                    payment.orderId,

                paymentStatus,

                transactionId:

                    payment.transactionId,

                paymentMethod:

                    payment.paymentMethod,

                paidAt:

                    paymentStatus === "PAID"

                        ? payment.settlementTime

                        : undefined,

                expiredAt:

                    paymentStatus === "EXPIRED"

                        ? payment.expiryTime

                        : undefined,

            });

            break;

        case "URGENT_TASK":

            await handleUrgentTaskPayment({

                orderId:

                    payment.orderId,

                paymentStatus,

                transactionId:

                    payment.transactionId,

                paymentMethod:

                    payment.paymentMethod,

                paidAt:

                    paymentStatus === "PAID"

                        ? payment.settlementTime

                        : undefined,

                expiredAt:

                    paymentStatus === "EXPIRED"

                        ? payment.expiryTime

                        : undefined,

            });

            break;

    }

    return {

        success: true,

    };

}