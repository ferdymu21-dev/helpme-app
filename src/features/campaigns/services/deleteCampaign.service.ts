import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  deleteCampaignRepository,
  getCampaignByIdRepository,
} from "../repositories";

export async function deleteCampaignService(
  campaignId: string,
): Promise<void> {
  await requireAdmin();

  if (!campaignId) {
    throw new Error(
      "Campaign ID tidak ditemukan.",
    );
  }

  /*
   * Verifikasi keberadaan resource
   * dilakukan setelah admin
   * authorization agar non-admin
   * tidak dapat melakukan enumeration.
   */
  await getCampaignByIdRepository(
    campaignId,
  );

  await deleteCampaignRepository(
    campaignId,
  );
}