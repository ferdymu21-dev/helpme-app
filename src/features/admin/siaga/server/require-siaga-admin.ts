import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

interface CurrentUserAccessState {
  role: string | null;
  is_admin: boolean | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  suspended_until: string | null;
}

export async function requireSiagaAdmin() {
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
    error: accessError,
  } = await supabase
    .rpc("get_current_user_access_state")
    .maybeSingle<CurrentUserAccessState>();

  if (accessError || !userData) {
    throw new Error("FORBIDDEN");
  }

  if (userData.is_banned || !userData.is_admin) {
    throw new Error("FORBIDDEN");
  }

  const suspensionEnd =
    userData.suspended_until === null
      ? Number.NaN
      : Date.parse(userData.suspended_until);

  const isCurrentlySuspended =
    userData.is_suspended === true &&
    (
      userData.suspended_until === null ||
      !Number.isFinite(suspensionEnd) ||
      suspensionEnd > Date.now()
    );

  if (isCurrentlySuspended) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    role: userData.role,
  };
}