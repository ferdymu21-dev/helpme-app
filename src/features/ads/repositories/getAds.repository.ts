import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdsRepository(
  position?: string,
) {
  const supabase =
    await createServerSupabaseClient();

  let query = supabase
    .from("ads")
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (position) {
    query = query.eq("position", position);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Gagal mengambil data iklan: ${error.message}`,
    );
  }

  return data;
}