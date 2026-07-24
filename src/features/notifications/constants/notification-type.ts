export const NotificationType = {

   /* =========================
      TASK
   ========================= */
   APPLY_TASK: "APPLY_TASK",

   TASK_ACCEPTED: "TASK_ACCEPTED",

   TASK_CANCELLED: "TASK_CANCELLED",

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

   /* =========================
      URGENT TASK PAYMENT
   ========================= */
   URGENT_TASK_PAID: "URGENT_TASK_PAID",

   URGENT_TASK_EXPIRED: "URGENT_TASK_EXPIRED",

} as const;

export type NotificationTypeValue =
   typeof NotificationType[
   keyof typeof NotificationType
   ];