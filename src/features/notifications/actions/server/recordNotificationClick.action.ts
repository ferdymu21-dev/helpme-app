"use server";

import {
  recordCampaignClickRepository,
} from "@/features/campaigns/repositories";

export async function recordNotificationClickAction(
  notificationId: string,
) {
  await recordCampaignClickRepository(notificationId);
}