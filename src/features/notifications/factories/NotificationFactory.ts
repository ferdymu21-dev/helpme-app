import {
  NotificationType,
} from "../constants/notification-type";

import type {
  CreateNotificationPayload,
} from "../types/notification.types";

function paymentDetailUrl(
  paymentId: string,
) {
  return `/payments/history/${paymentId}`;
}

export const NotificationFactory = {
  donationPaid(
    userId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Donasi berhasil",

      message:
        "Terima kasih telah mendukung HelpMe.",

      type:
        NotificationType.DONATION_PAID,
    };
  },

  donationExpired(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran kedaluwarsa",

      message:
        "Batas waktu pembayaran donasi telah habis.",

      type:
        NotificationType.DONATION_EXPIRED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  donationFailed(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran gagal",

      message:
        "Pembayaran donasi tidak berhasil diproses.",

      type:
        NotificationType.DONATION_FAILED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  donationCancelled(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran dibatalkan",

      message:
        "Transaksi pembayaran donasi telah dibatalkan.",

      type:
        NotificationType.DONATION_CANCELLED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  urgentTaskPaid(
    userId: string,

    taskId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Task berhasil dibuat",

      message:
        "Pembayaran berhasil. Task kamu sudah dipublikasikan.",

      type:
        NotificationType.URGENT_TASK_PAID,

      taskId,

      redirectUrl:
        `/tasks/${taskId}`,
    };
  },

  urgentTaskExpired(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran kedaluwarsa",

      message:
        "Batas waktu pembayaran prioritas task telah habis.",

      type:
        NotificationType.URGENT_TASK_EXPIRED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  urgentTaskFailed(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran gagal",

      message:
        "Pembayaran prioritas task tidak berhasil diproses.",

      type:
        NotificationType.URGENT_TASK_FAILED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  urgentTaskCancelled(
    userId: string,

    paymentId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Pembayaran dibatalkan",

      message:
        "Transaksi pembayaran prioritas task telah dibatalkan.",

      type:
        NotificationType.URGENT_TASK_CANCELLED,

      redirectUrl:
        paymentDetailUrl(
          paymentId,
        ),
    };
  },

  taskCompletionProofSubmitted(
    userId: string,

    taskId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Helper menyelesaikan task",

      message:
        "Helper telah mengirim bukti penyelesaian. Silakan periksa dan konfirmasi.",

      type:
        NotificationType.TASK_COMPLETION_PROOF_SUBMITTED,

      taskId,

      redirectUrl:
        `/tasks/${taskId}`,
    };
  },

  taskCompletionConfirmed(
    userId: string,

    taskId: string,
  ): CreateNotificationPayload {
    return {
      userId,

      title:
        "Task selesai",

      message:
        "Pemilik task telah mengonfirmasi penyelesaian pekerjaan.",

      type:
        NotificationType.TASK_COMPLETION_CONFIRMED,

      taskId,

      redirectUrl:
        `/tasks/${taskId}`,
    };
  },
};