import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type { UpdateAdInput } from "@/features/ads/validators/updateAd.validator";

export async function updateAdRepository(
  id: string,
  input: UpdateAdInput,
) {
  const { data, error } = await adminSupabase
    .from("ads")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(
      "updateAdRepository error:",
      error,
    );

    throw new Error(
      "Gagal memperbarui iklan.",
    );
  }

  if (!data) {
    throw new Error("AD_NOT_FOUND");
  }

  return data;
}