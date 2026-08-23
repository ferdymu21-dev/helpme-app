import { adminSupabase } from "@/lib/supabase/admin";

const ADS_BUCKET = "ads";

export async function uploadAdImageRepository(
  filePath: string,
  file: File,
) {
  const { error } = await adminSupabase.storage
    .from(ADS_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Gagal mengupload gambar iklan: ${error.message}`,
    );
  }

  const {
    data: { publicUrl },
  } = adminSupabase.storage
    .from(ADS_BUCKET)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl,
  };
}