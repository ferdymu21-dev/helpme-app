"use server";

import { deleteCampaignService } from "../services";

export async function deleteCampaignAction(campaignId: string) {
  return deleteCampaignService(campaignId);
}