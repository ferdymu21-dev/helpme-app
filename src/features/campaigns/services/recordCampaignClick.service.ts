import "server-only";

import { CampaignEvent } from "../constants/campaign-event";

import { recordCampaignEngagementEventRepository } from "../repositories";

export async function recordCampaignClickService(
  notificationId: string,
  userId: string,
) {
  if (!notificationId) {
    throw new Error("Notification ID wajib diisi.");
  }

  if (!userId) {
    throw new Error("User ID wajib diisi.");
  }

  return recordCampaignEngagementEventRepository({
    notificationId,
    userId,
    eventType: CampaignEvent.CLICKED,
  });
}