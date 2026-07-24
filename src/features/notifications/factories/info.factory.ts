import {
    NotificationType,
} from "../constants/notification-type";

export function buildInfoBroadcastNotification(
    userId: string,
    title: string,
    message: string,
    redirectUrl?: string,
) {

    return {

        userId,

        title,

        message,

        type:
            NotificationType.INFO_BROADCAST,

        redirectUrl,

    };

}