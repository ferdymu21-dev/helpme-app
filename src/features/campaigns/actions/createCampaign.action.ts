"use server";

import { createCampaignService } from "../services";

import type {
    CreateCampaignPayload,
} from "../types/campaign.types";

export async function createCampaignAction(
    payload: CreateCampaignPayload,
) {
    return createCampaignService(payload);
}