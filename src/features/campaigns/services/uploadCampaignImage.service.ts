import { supabase } from "@/lib/supabase/client";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadCampaignImage(file: File): Promise<string> {
  // Validasi file
  if (!file) {
    throw new Error("File tidak ditemukan.");
  }

  if (file.size === 0) {
    throw new Error("File kosong.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  const filename = `${crypto.randomUUID()}.${extension}`;

  const path = `images/${filename}`;

  const { error } = await supabase.storage
    .from("campaigns")
    .upload(path, file, {
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("campaigns")
    .getPublicUrl(path);

  return data.publicUrl;
}