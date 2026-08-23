import { CampaignStatus } from "../constants/campaign-status";

import { buildCampaignBase } from "./buildCampaignBase";

import type {
  CreateCampaignPayload,
  InsertCampaignPayload,
} from "../types/campaign.types";

export function buildScheduledCampaign(
  payload: CreateCampaignPayload,
): InsertCampaignPayload {
  return {
    ...buildCampaignBase(payload),

    status: CampaignStatus.SCHEDULED,

    scheduled_at: payload.scheduledAt!,

    published_at: null,
  };
}