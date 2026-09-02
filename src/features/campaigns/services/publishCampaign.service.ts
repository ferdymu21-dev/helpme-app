import { CampaignStatus } from "../constants/campaign-status";

import {
  getCampaignByIdRepository,
  updateCampaignStatusRepository,
} from "../repositories";

export async function publishCampaignService(campaignId: string) {
  const campaign = await getCampaignByIdRepository(campaignId);

  /*
   * Concurrent scheduler yang sudah
   * diselesaikan invocation lain
   * dianggap idempotent success.
   */
  if (campaign.status === CampaignStatus.PUBLISHED) {
    return;
  }

  /*
   * Jalur ini khusus scheduler.
   *
   * Campaign yang telah CANCELLED,
   * FINISHED, atau berubah ke status
   * lain tidak boleh dihidupkan kembali
   * oleh cron.
   */
  if (campaign.status !== CampaignStatus.SCHEDULED) {
    throw new Error(
      "Campaign sudah tidak dapat dipublikasikan oleh scheduler.",
    );
  }

  const values: Record<string, unknown> = {};

  if (!campaign.published_at) {
    values.published_at = new Date().toISOString();
  }

  const updated = await updateCampaignStatusRepository(
    campaignId,

    CampaignStatus.PUBLISHED,

    values,

    CampaignStatus.SCHEDULED,
  );

  if (updated) {
    return;
  }

  /*
   * Status mungkin berubah setelah
   * SELECT. Periksa keadaan terbaru.
   */
  const latestCampaign = await getCampaignByIdRepository(campaignId);

  if (latestCampaign.status === CampaignStatus.PUBLISHED) {
    return;
  }

  throw new Error("Campaign berubah status sebelum proses publish selesai.");
}