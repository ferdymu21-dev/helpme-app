import { createNotificationServer } from "../../server";

import { NotificationType } from "../../constants/notification-type";

export async function notifyReviewCreated(helperId: string) {
  await createNotificationServer({
    userId: helperId,

    title: "Review Baru",

    message: "Mantap! Anda menerima ulasan baru",

    type: NotificationType.NEW_REVIEW,
  });
}