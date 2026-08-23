import { publishCampaignService } from "../services/publishCampaign.service";

import { broadcastCampaignService } from "../services/broadcastCampaign.service";

import { getCampaignByIdRepository } from "../repositories";

export async function publishCampaignEngine(campaignId: string) {
  await publishCampaignService(campaignId);

  const campaign = await getCampaignByIdRepository(campaignId);

  if (!campaign) {
    throw new Error("Campaign tidak ditemukan.");
  }

  await broadcastCampaignService(campaign);
}