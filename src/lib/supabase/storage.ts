"use client";

import imageCompression from "browser-image-compression";
import { supabase } from "./client";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB sebelum compression

export async function uploadTaskCompletionProof(
  taskId: string,
  file: File,
) {
  // ===========================
  // Validation
  // ===========================

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
    throw new Error("Ukuran gambar maksimal 10 MB.");
  }

  // ===========================

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
  });

  const filePath = `${taskId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("task-completion-proofs")
    .upload(filePath, compressed);

  if (error) {
    throw error;
  }

  return filePath;
}