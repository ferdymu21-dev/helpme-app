import { NotificationCategory } from "./notification-category";

import { NotificationType } from "./notification-type";

export const NotificationTypeCategoryMap = {
  /* =========================
       TASK
    ========================= */
  [NotificationType.APPLY_TASK]: NotificationCategory.TASK,

  [NotificationType.TASK_ACCEPTED]: NotificationCategory.TASK,

  [NotificationType.TASK_COMPLETED]: NotificationCategory.TASK,

  [NotificationType.TASK_COMPLETION_PROOF_SUBMITTED]: NotificationCategory.TASK,

  [NotificationType.TASK_COMPLETION_CONFIRMED]: NotificationCategory.TASK,

  [NotificationType.TASK_CANCELLED]: NotificationCategory.TASK,

  /* =========================
       SERVICE
    ========================= */
  [NotificationType.SERVICE_LISTING_EXPIRED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_REQUEST_CREATED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_REQUEST_NEGOTIATING]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_REQUEST_DECLINED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_REQUEST_CANCELLED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_AGREEMENT_PROPOSED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_AGREEMENT_APPROVED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_AGREEMENT_REJECTED]: NotificationCategory.SERVICE,

  [NotificationType.SERVICE_REQUEST_IN_PROGRESS]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_COMPLETION_SUBMITTED]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_COMPLETION_REVISION_REQUESTED]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_COMPLETION_ACCEPTED]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_PAYMENT_REPORTED]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_PAYMENT_CONFIRMED]:
    NotificationCategory.SERVICE,

  [NotificationType.SERVICE_PAYMENT_ISSUE]:
    NotificationCategory.SERVICE,

  /* =========================
       REVIEW
    ========================= */
  [NotificationType.NEW_REVIEW]: NotificationCategory.REVIEW,

  /* =========================
       INFO
    ========================= */
  [NotificationType.INFO_BROADCAST]: NotificationCategory.INFO,

  /* =========================
       DONATION
    ========================= */
  [NotificationType.DONATION_PAID]: NotificationCategory.PAYMENT,

  [NotificationType.DONATION_EXPIRED]: NotificationCategory.PAYMENT,

  [NotificationType.DONATION_FAILED]: NotificationCategory.PAYMENT,

  [NotificationType.DONATION_CANCELLED]: NotificationCategory.PAYMENT,

  /* =========================
       URGENT PAYMENT
    ========================= */
  [NotificationType.URGENT_TASK_PAID]: NotificationCategory.PAYMENT,

  [NotificationType.URGENT_TASK_EXPIRED]: NotificationCategory.PAYMENT,

  [NotificationType.URGENT_TASK_FAILED]: NotificationCategory.PAYMENT,

  [NotificationType.URGENT_TASK_CANCELLED]: NotificationCategory.PAYMENT,
} as const;
