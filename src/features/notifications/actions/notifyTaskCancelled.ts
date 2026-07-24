import {
    sendNotification,
} from "../services/notification.service";

import {
    NotificationType,
} from "../constants/notification-type";

export async function notifyTaskCancelled(
    helperId: string,
    taskId: string,
) {

    await sendNotification(
        helperId,
        "Task dibatalkan",
        "Task yang kamu ikuti telah dibatalkan.",
        NotificationType.TASK_CANCELLED,
        taskId,
        `/tasks/${taskId}`,
    );

}