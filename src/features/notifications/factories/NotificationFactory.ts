import { NotificationType } from "../constants/notification-type";
import type { CreateNotificationPayload } from "../types/notification.types";

export const NotificationFactory = {
  donationPaid(userId: string): CreateNotificationPayload {
    return {
      userId,
      title: "Donasi berhasil",
      message: "Terima kasih telah mendukung HelpMe.",
      type: NotificationType.DONATION_PAID,
    };
  },

  donationExpired(userId: string): CreateNotificationPayload {
    return {
      userId,
      title: "Donasi dibatalkan",
      message: "Pembayaran donasi telah kedaluwarsa.",
      type: NotificationType.DONATION_EXPIRED,
    };
  },

  urgentTaskPaid(userId: string, taskId: string): CreateNotificationPayload {
    return {
      userId,
      title: "Task berhasil dibuat",
      message: "Pembayaran berhasil. Task kamu sudah dipublikasikan.",
      type: NotificationType.URGENT_TASK_PAID,
      taskId,
      redirectUrl: `/tasks/${taskId}`,
    };
  },

  urgentTaskExpired(userId: string): CreateNotificationPayload {
    return {
      userId,
      title: "Pembayaran gagal",
      message: "Batas waktu pembayaran telah habis.",
      type: NotificationType.URGENT_TASK_EXPIRED,
    };
  },

  taskCompletionProofSubmitted(
    userId: string,
    taskId: string,
  ): CreateNotificationPayload {
    return {
      userId,
      title: "Helper menyelesaikan task",
      message: "Helper telah mengirim bukti penyelesaian. Silakan periksa dan konfirmasi.",
      type: NotificationType.TASK_COMPLETION_PROOF_SUBMITTED,
      taskId,
      redirectUrl: `/tasks/${taskId}`,
    };
  },

  taskCompletionConfirmed(
    userId: string,
    taskId: string,
  ): CreateNotificationPayload {
    return {
      userId,
      title: "Task selesai",
      message: "Pemilik task telah mengonfirmasi penyelesaian pekerjaan.",
      type: NotificationType.TASK_COMPLETION_CONFIRMED,
      taskId,
      redirectUrl: `/tasks/${taskId}`,
    };
  },
};