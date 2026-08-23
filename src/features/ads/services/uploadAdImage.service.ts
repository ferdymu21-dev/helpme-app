import { requireAdmin } from "@/features/admin/services/admin-auth.service";

import { uploadAdImageRepository } from "../repositories/uploadAdImage.repository";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function getFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      throw new Error("Format gambar tidak didukung.");
  }
}

export async function uploadAdImageService(file: File) {
  await requireAdmin();

  if (!(file instanceof File)) {
    throw new Error("File gambar wajib diisi.");
  }

  if (file.size <= 0) {
    throw new Error("File gambar kosong.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Format gambar harus JPG, PNG, atau WebP.");
  }

  const extension = getFileExtension(file.type);

  const filePath = `ads/${crypto.randomUUID()}.${extension}`;

  return uploadAdImageRepository(filePath, file);
}