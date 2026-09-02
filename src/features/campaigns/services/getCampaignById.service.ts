import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  getCampaignByIdRepository,
} from "../repositories";

export async function getCampaignByIdService(
  id: string,
) {
  await requireAdmin();

  if (!id) {
    throw new Error(
      "Campaign ID tidak ditemukan.",
    );
  }

  return getCampaignByIdRepository(
    id,
  );
}