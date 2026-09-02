export const NotificationType = {
  /* =========================
      TASK
   ========================= */
  APPLY_TASK: "APPLY_TASK",

  TASK_ACCEPTED: "TASK_ACCEPTED",

  TASK_CANCELLED: "TASK_CANCELLED",

  TASK_COMPLETED: "TASK_COMPLETED",

  TASK_COMPLETION_PROOF_SUBMITTED: "TASK_COMPLETION_PROOF_SUBMITTED",

  TASK_COMPLETION_CONFIRMED: "TASK_COMPLETION_CONFIRMED",

  /* =========================
      REVIEW
   ========================= */
  NEW_REVIEW: "NEW_REVIEW",

  /* =========================
      INFO
   ========================= */
  INFO_BROADCAST: "INFO_BROADCAST",

  /* =========================
    DONATION
 ========================= */
  DONATION_PAID: "DONATION_PAID",

  DONATION_EXPIRED: "DONATION_EXPIRED",

  DONATION_FAILED: "DONATION_FAILED",

  DONATION_CANCELLED: "DONATION_CANCELLED",

  /* =========================
    URGENT TASK PAYMENT
 ========================= */
  URGENT_TASK_PAID: "URGENT_TASK_PAID",

  URGENT_TASK_EXPIRED: "URGENT_TASK_EXPIRED",

  URGENT_TASK_FAILED: "URGENT_TASK_FAILED",

  URGENT_TASK_CANCELLED: "URGENT_TASK_CANCELLED",
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];