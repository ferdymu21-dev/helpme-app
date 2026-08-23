import { adminSupabase } from "@/lib/supabase/admin";

export async function getAdminAdsRepository() {
  const { data, error } = await adminSupabase
    .from("ads")
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Gagal mengambil data iklan admin: ${error.message}`,
    );
  }

  return data;
}