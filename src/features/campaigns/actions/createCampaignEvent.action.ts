"use server";

import { createCampaignEventService } from "../services";

import type { CreateCampaignEventPayload } from "../types/campaign-event.types";

export async function createCampaignEventAction(
  payload: CreateCampaignEventPayload,
) {
  await createCampaignEventService(payload);
}