import { deleteCampaignRepository } from "../repositories";

import { getCampaignByIdRepository } from "../repositories";

export async function deleteCampaignService(campaignId: string): Promise<void> {
  if (!campaignId) {
    throw new Error("Campaign ID tidak ditemukan.");
  }

  /*
   * Pastikan campaign memang ada
   * sebelum dihapus.
   */

  await getCampaignByIdRepository(campaignId);

  await deleteCampaignRepository(campaignId);
}