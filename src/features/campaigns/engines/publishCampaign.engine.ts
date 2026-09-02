import { CampaignStatus } from "../constants/campaign-status";

import { publishCampaignService } from "../services/publishCampaign.service";

import { broadcastCampaignService } from "../services/broadcastCampaign.service";

import { getCampaignByIdRepository } from "../repositories";

export async function publishCampaignEngine(campaignId: string) {
  const campaign = await getCampaignByIdRepository(campaignId);

  if (!campaign) {
    throw new Error("Campaign tidak ditemukan.");
  }

  /*
   * Concurrent scheduler yang sudah
   * diselesaikan invocation lain
   * boleh berhenti dengan aman.
   */
  if (campaign.status === CampaignStatus.PUBLISHED) {
    return;
  }

  /*
   * Scheduler hanya boleh
   * memproses SCHEDULED campaign.
   */
  if (campaign.status !== CampaignStatus.SCHEDULED) {
    throw new Error(
      "Campaign sudah tidak dapat dipublikasikan oleh scheduler.",
    );
  }

  /*
   * Broadcast terlebih dahulu.
   *
   * Delivery sekarang idempotent,
   * sehingga crash di tengah dapat
   * dilanjutkan cron berikutnya.
   */
  await broadcastCampaignService(campaign);

  /*
   * Hanya setelah seluruh recipient
   * berhasil diproses, ubah menjadi
   * PUBLISHED.
   */
  await publishCampaignService(campaignId);
}