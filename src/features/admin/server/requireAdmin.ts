import { createServerSupabaseClient } from "@/lib/supabase/server";

interface CurrentUserAccessState {
  role: string | null;
  is_admin: boolean | null;
  is_banned: boolean | null;
}

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const {
    data: userData,
    error: userError,
  } = await supabase
    .rpc("get_current_user_access_state")
    .maybeSingle<CurrentUserAccessState>();

  if (userError || !userData) {
    throw new Error("UNAUTHORIZED");
  }

  if (userData.is_banned) {
    throw new Error("BANNED");
  }

  if (!userData.is_admin) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    role: userData.role,
  };
}