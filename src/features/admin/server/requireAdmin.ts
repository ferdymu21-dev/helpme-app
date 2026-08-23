import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(
      `
                    role,
                    is_banned
                `,
    )
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    throw new Error("UNAUTHORIZED");
  }

  if (userData.is_banned) {
    throw new Error("BANNED");
  }

  if (userData.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    role: userData.role,
  };
}