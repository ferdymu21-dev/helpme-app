"use server";

import { publishCampaignEngine } from "../engines/publishCampaign.engine";

export async function publishCampaignAction(
  campaignId: string,
) {
  return publishCampaignEngine(campaignId);
}