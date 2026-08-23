import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export async function deleteAdRepository(id: string) {
  const { data, error } = await adminSupabase
    .from("ads")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("deleteAdRepository error:", error);

    throw new Error("Gagal menghapus iklan.");
  }

  if (!data) {
    throw new Error("AD_NOT_FOUND");
  }

  return data;
}