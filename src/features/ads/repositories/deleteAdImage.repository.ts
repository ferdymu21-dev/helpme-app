import { adminSupabase } from "@/lib/supabase/admin";

const ADS_BUCKET = "ads";

export async function deleteAdImageRepository(
  filePath: string,
) {
  const { error } = await adminSupabase.storage
    .from(ADS_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(
      `Gagal menghapus gambar iklan: ${error.message}`,
    );
  }
}