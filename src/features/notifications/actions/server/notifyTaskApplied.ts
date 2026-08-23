import {
    sendNotification,
} from "../../services/notification.service";

import {
    NotificationType,
} from "../../constants/notification-type";

export async function notifyTaskApplied(
    ownerId: string,
    taskId: string,
) {

    await sendNotification(
        ownerId,
        "Bantuan datang",
        "Seseorang ingin membantu",
        NotificationType.APPLY_TASK,
        taskId,
        `/tasks/${taskId}`,
    );

}