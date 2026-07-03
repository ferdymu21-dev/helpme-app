import {

    parseNotification,

} from "./notification.parser";

import {

    resolvePaymentStatus,

} from "./paymentStatus.mapper";

import {

    updateDonationPayment,

} from "./webhook.repository";

import type {

    MidtransNotification,

} from "./midtrans.types";

export async function handlePaymentNotification(

    notification: MidtransNotification

) {

    const payment =

        parseNotification(

            notification

        );

    console.log(

        "[PAYMENT]",

        payment

    );

    const paymentStatus =

        resolvePaymentStatus(

            payment.status

        );

    console.log(

        "[STATUS]",

        paymentStatus

    );

    await updateDonationPayment({

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

    console.log(

        "[DATABASE UPDATED]"

    );

    return {

        success: true,

    };

}