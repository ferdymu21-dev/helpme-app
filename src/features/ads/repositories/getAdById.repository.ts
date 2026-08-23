import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdByIdRepository(
  id: string,
) {
  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(
      `Gagal mengambil iklan: ${error.message}`,
    );
  }

  return data;
}