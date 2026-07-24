import {
    sendNotification,
} from "../services/notification.service";

import {
    NotificationType,
} from "../constants/notification-type";

export async function notifyTaskAccepted(
    helperId: string,
    taskId: string,
) {

    await sendNotification(
        helperId,
        "Kamu dipilih!",
        "Pemilik task membutuhkan bantuanmu.",
        NotificationType.TASK_ACCEPTED,
        taskId,
        `/tasks/${taskId}`,
    );

}