export const NotificationCategory = {
    ALL: "ALL",
    TASK: "TASK",
    PAYMENT: "PAYMENT",
    REVIEW: "REVIEW",
    INFO: "INFO",
    SYSTEM: "SYSTEM",
} as const;

export type NotificationCategoryValue =

    typeof NotificationCategory[
        keyof typeof NotificationCategory
    ];