"use server";

import { recordCampaignClickService } from "../services";

export async function recordCampaignClickAction(
  notificationId: string,
) {
  await recordCampaignClickService(notificationId);
}