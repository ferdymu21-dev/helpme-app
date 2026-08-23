import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { deleteAdRepository } from "@/features/ads/repositories/deleteAd.repository";

export async function deleteAdService(id: string) {
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

  return deleteAdRepository(id);
}