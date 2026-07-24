import {
    updateDonationPayment,
} from "../webhook.repository";

import {
    findDonationByOrderId,
} from "../payment.repository";

import {
    createNotificationServer,
} from "@/features/notifications/server";

import {
    NotificationFactory,
} from "@/features/notifications/factories";

interface DonationHandlerPayload {

    orderId: string;

    paymentStatus: string;

    transactionId: string;

    paymentMethod: string;

    paidAt?: string;

    expiredAt?: string;

}

export async function handleDonationPayment(

    payload: DonationHandlerPayload

) {

    await updateDonationPayment(

        payload

    );

    const donation =

        await findDonationByOrderId(

            payload.orderId

        );

    if (!donation) {

        throw new Error(

            "Donation tidak ditemukan."

        );

    }

    switch (

        payload.paymentStatus

    ) {

        case "PAID":

            await createNotificationServer(

                NotificationFactory.donationPaid(

                    donation.user_id

                )

            );

            break;

        case "EXPIRED":

            await createNotificationServer(

                NotificationFactory.donationExpired(

                    donation.user_id

                )

            );

            break;

    }

}