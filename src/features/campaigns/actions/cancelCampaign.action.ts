"use server";

import { cancelCampaignService } from "../services";

export async function cancelCampaignAction(
    campaignId: string,
) {
    return cancelCampaignService(campaignId);
}