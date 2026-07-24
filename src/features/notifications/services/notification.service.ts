import {
    createNotificationServer,
} from "../server";

import {
    NotificationTypeValue,
} from "../constants/notification-type";

export async function sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationTypeValue,
    taskId?: string,
    redirectUrl?: string,
) {

    return createNotificationServer({
        userId,
        title,
        message,
        type,
        taskId,
        redirectUrl,
    });
}