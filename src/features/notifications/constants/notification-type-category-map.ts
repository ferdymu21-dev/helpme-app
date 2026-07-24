import {
    NotificationCategory,
} from "./notification-category";

import {
    NotificationType,
} from "./notification-type";

export const NotificationTypeCategoryMap = {

    /* =========================
       TASK
    ========================= */
    [NotificationType.APPLY_TASK]:
        NotificationCategory.TASK,

    [NotificationType.TASK_ACCEPTED]:
        NotificationCategory.TASK,

    [NotificationType.TASK_CANCELLED]:
        NotificationCategory.TASK,

    /* =========================
       REVIEW
    ========================= */
    [NotificationType.NEW_REVIEW]:
        NotificationCategory.REVIEW,
    
    /* =========================
       INFO
    ========================= */
    [NotificationType.INFO_BROADCAST]:
    NotificationCategory.INFO,

    /* =========================
       DONATION
    ========================= */
    [NotificationType.DONATION_PAID]:
        NotificationCategory.PAYMENT,

    [NotificationType.DONATION_EXPIRED]:
        NotificationCategory.PAYMENT,

    /* =========================
       URGENT PAYMENT
    ========================= */
    [NotificationType.URGENT_TASK_PAID]:
        NotificationCategory.PAYMENT,

    [NotificationType.URGENT_TASK_EXPIRED]:
        NotificationCategory.PAYMENT,

} as const;