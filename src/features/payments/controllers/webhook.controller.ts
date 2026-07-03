import type {
    MidtransNotification,
} from "@/lib/payments/server";

import {
    processWebhook,
} from "@/lib/payments/server";

export async function webhookController(

    notification: MidtransNotification

) {

    return await processWebhook(

        notification

    );

}