import { CampaignAction } from "../constants/campaign-action";

import type { CreateCampaignPayload } from "../types/campaign.types";

export function validateCreateCampaign(payload: CreateCampaignPayload): void {
  /*
    ==========================
    SCHEDULE
    ==========================
    */

  if (payload.action === CampaignAction.SCHEDULE && !payload.scheduledAt) {
    throw new Error("Campaign terjadwal harus memiliki scheduledAt.");
  }

  /*
    ==========================
    PUBLISH
    ==========================
    */

  if (payload.action === CampaignAction.PUBLISH && payload.scheduledAt) {
    throw new Error("Campaign Publish tidak boleh memiliki scheduledAt.");
  }

  /*
    ==========================
    DRAFT
    ==========================
    */

  if (payload.action === CampaignAction.DRAFT && payload.scheduledAt) {
    throw new Error("Campaign Draft tidak boleh memiliki scheduledAt.");
  }
}