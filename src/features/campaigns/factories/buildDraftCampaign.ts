import { CampaignStatus } from "../constants/campaign-status";

import { buildCampaignBase } from "./buildCampaignBase";

import type {
  CreateCampaignPayload,
  InsertCampaignPayload,
} from "../types/campaign.types";

export function buildDraftCampaign(
  payload: CreateCampaignPayload,
): InsertCampaignPayload {
  return {
    ...buildCampaignBase(payload),

    status: CampaignStatus.DRAFT,

    scheduled_at: null,

    published_at: null,
  };
}