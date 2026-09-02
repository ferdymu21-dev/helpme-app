import "server-only";

import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

interface CurrentUserAccessState {
  role: string | null;

  is_admin: boolean | null;

  is_banned: boolean | null;
}

export async function requireAdmin() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const {
    data: userData,
    error: roleError,
  } =
    await supabase
      .rpc(
        "get_current_user_access_state",
      )
      .maybeSingle<CurrentUserAccessState>();

  if (
    roleError ||
    !userData
  ) {
    throw new Error(
      "FORBIDDEN",
    );
  }

  /*
   * Banned account tidak boleh
   * menjalankan privileged admin
   * operation walaupun flag admin
   * masih true.
   */
  if (
    userData.is_banned
  ) {
    throw new Error(
      "FORBIDDEN",
    );
  }

  if (
    !userData.is_admin
  ) {
    throw new Error(
      "FORBIDDEN",
    );
  }

  return {
    user,

    supabase,

    role:
      userData.role,
  };
}