import { updateCampaignRepository } from "../repositories";

import type {
  NotificationCampaign,
  UpdateCampaignPayload,
} from "../types/campaign.types";

export async function updateCampaignService(
  payload: UpdateCampaignPayload,
): Promise<NotificationCampaign> {
  if (!payload.id) {
    throw new Error("Campaign ID tidak ditemukan.");
  }

  if (payload.title !== undefined && !payload.title.trim()) {
    throw new Error("Judul wajib diisi.");
  }

  if (payload.message !== undefined && !payload.message.trim()) {
    throw new Error("Pesan wajib diisi.");
  }

  return updateCampaignRepository(payload);
}