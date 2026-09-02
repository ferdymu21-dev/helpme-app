import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  getCampaignsRepository,
} from "../repositories";

export async function getCampaignsService() {
  await requireAdmin();

  return getCampaignsRepository();
}