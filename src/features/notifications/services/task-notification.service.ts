import {
    NotificationType,
} from "../constants/notification-type";

import {
    sendNotification,
} from "./notification.service";

/* =========================
   TASK APPLIED
========================= */

export async function sendTaskAppliedNotification(
    ownerId: string,
    taskId: string,
) {

    return sendNotification(
        ownerId,
        "Bantuan datang",
        "Seseorang ingin membantu",
        NotificationType.APPLY_TASK,
        taskId,
        `/tasks/${taskId}`,
    );

}

/* =========================
   TASK ACCEPTED
========================= */

export async function sendTaskAcceptedNotification(
    helperId: string,
    taskId: string,
) {

    return sendNotification(
        helperId,
        "Kamu dipilih!",
        "Pemilik task memilihmu sebagai helper.",
        NotificationType.TASK_ACCEPTED,
        taskId,
        `/tasks/${taskId}`,
    );

}

/* =========================
   TASK CANCELLED
========================= */

export async function sendTaskCancelledNotification(
    helperId: string,
    taskId: string,
) {

    return sendNotification(
        helperId,
        "Task dibatalkan",
        "Task yang kamu ikuti telah dibatalkan.",
        NotificationType.TASK_CANCELLED,
        taskId,
        `/tasks/${taskId}`,
    );

}