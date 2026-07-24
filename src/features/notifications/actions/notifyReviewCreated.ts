import {
    createNotification,
} from "../services";

import {
    NotificationType,
} from "../constants/notification-type";

export async function notifyReviewCreated(

    helperId: string,

) {

    await createNotification({

        userId: helperId,

        title: "Review Baru",

        message:
            "Mantap! Anda menerima ulasan baru",

        type:
            NotificationType.NEW_REVIEW,

    });

}