import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: userData, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (roleError) {
    throw new Error("Gagal memverifikasi role admin.");
  }

  if (userData?.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    supabase,
  };
}