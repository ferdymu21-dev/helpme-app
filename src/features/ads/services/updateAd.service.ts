import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { updateAdRepository } from "@/features/ads/repositories/updateAd.repository";

import {
  updateAdSchema,
  type UpdateAdInput,
} from "@/features/ads/validators/updateAd.validator";

export async function updateAdService(id: string, input: unknown) {
  if (!id) {
    throw new Error("INVALID_ID");
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    throw new Error("FORBIDDEN");
  }

  if (userData.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const validatedInput: UpdateAdInput = updateAdSchema.parse(input);

  return updateAdRepository(id, validatedInput);
}