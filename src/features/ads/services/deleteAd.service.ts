import "server-only";

import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  deleteAdRepository,
} from "@/features/ads/repositories/deleteAd.repository";

export async function deleteAdService(
  id: string,
) {
  await requireAdmin();

  if (!id) {
    throw new Error(
      "INVALID_ID",
    );
  }

  return deleteAdRepository(
    id,
  );
}