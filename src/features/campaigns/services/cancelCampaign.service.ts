import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import {
  changeCampaignStatusService,
} from "./changeCampaignStatus.service";

export async function cancelCampaignService(
  campaignId: string,
) {
  await requireAdmin();

  if (!campaignId) {
    throw new Error(
      "Campaign ID tidak ditemukan.",
    );
  }

  await changeCampaignStatusService({
    campaignId,

    status:
      CampaignStatus.CANCELLED,
  });
}