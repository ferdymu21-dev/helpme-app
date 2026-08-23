import { requireAdmin } from "@/features/admin/services/admin-auth.service";

import { deleteAdImageRepository } from "../repositories/deleteAdImage.repository";

function extractStoragePath(imageUrl: string) {
  const marker = "/storage/v1/object/public/ads/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return imageUrl.slice(index + marker.length);
}

export async function deleteAdImageService(imageUrl: string) {
  await requireAdmin();

  const filePath = extractStoragePath(imageUrl);

  if (!filePath) {
    return;
  }

  await deleteAdImageRepository(filePath);
}