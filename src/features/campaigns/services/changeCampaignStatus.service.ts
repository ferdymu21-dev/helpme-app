import { CampaignStatus } from "../constants/campaign-status";

import type { ChangeCampaignStatusPayload } from "../types/change-campaign-status.types";

import {
  getCampaignByIdRepository,
  updateCampaignStatusRepository,
} from "../repositories";

import { validateCampaignTransition } from "../validators";

export async function changeCampaignStatusService({
  campaignId,

  status,
}: ChangeCampaignStatusPayload) {
  const campaign = await getCampaignByIdRepository(campaignId);

  /*
   * Same-target retry merupakan
   * idempotent success.
   */
  if (campaign.status === status) {
    return;
  }

  validateCampaignTransition(
    campaign.status,

    status,
  );

  const values: Record<string, unknown> = {};

  if (status === CampaignStatus.PUBLISHED && !campaign.published_at) {
    values.published_at = new Date().toISOString();
  }

  const updated = await updateCampaignStatusRepository(
    campaignId,

    status,

    values,

    campaign.status,
  );

  if (updated) {
    return;
  }

  /*
   * Status berubah setelah SELECT.
   *
   * Jika request lain sudah mencapai
   * target yang sama, operasi tetap
   * dianggap sukses.
   */
  const latestCampaign = await getCampaignByIdRepository(campaignId);

  if (latestCampaign.status === status) {
    return;
  }

  throw new Error("Status campaign telah berubah. Silakan coba lagi.");
}