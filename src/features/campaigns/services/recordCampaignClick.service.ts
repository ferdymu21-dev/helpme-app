import { recordCampaignClickRepository } from "../repositories";

export async function recordCampaignClickService(
  notificationId: string,
) {
  return recordCampaignClickRepository(notificationId);
}