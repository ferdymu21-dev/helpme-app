"use server";

import { updateCampaignService } from "../services";

import type {
    UpdateCampaignPayload,
} from "../types/campaign.types";

export async function updateCampaignAction(
    payload: UpdateCampaignPayload,
) {
    return updateCampaignService(payload);
}