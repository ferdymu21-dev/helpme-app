import {
    NotificationType,
} from "../constants/notification-type";

import type {
    CreateNotificationPayload,
} from "../types/notification.types";

export const NotificationFactory = {

    donationPaid(
        userId: string,
    ): CreateNotificationPayload {

        return {

            userId,

            title: "Donasi berhasil",

            message:
                "Terima kasih telah mendukung HelpMe.",

            type: NotificationType.DONATION_PAID,

        };

    },

    donationExpired(
        userId: string,
    ): CreateNotificationPayload {

        return {

            userId,

            title: "Donasi dibatalkan",

            message:
                "Pembayaran donasi telah kedaluwarsa.",

            type: NotificationType.DONATION_EXPIRED,

        };

    },

    urgentTaskPaid(
        userId: string,
        taskId: string,
    ): CreateNotificationPayload {

        return {

            userId,

            title: "Task berhasil dibuat",

            message:
                "Pembayaran berhasil. Task kamu sudah dipublikasikan.",

            type: NotificationType.URGENT_TASK_PAID,

            taskId,

            redirectUrl: `/tasks/${taskId}`,

        };

    },

    urgentTaskExpired(
        userId: string,
    ): CreateNotificationPayload {

        return {

            userId,

            title: "Pembayaran gagal",

            message:
                "Batas waktu pembayaran telah habis.",

            type: NotificationType.URGENT_TASK_EXPIRED,

        };

    },

};