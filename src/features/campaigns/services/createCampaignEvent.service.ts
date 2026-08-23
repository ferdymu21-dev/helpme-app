import { createCampaignEventRepository } from "../repositories";

import type { CreateCampaignEventPayload } from "../types/campaign-event.types";

export async function createCampaignEventService(
  payload: CreateCampaignEventPayload,
) {
  await createCampaignEventRepository(payload);
}