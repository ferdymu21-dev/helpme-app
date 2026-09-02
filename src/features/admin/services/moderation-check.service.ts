import { supabase } from "@/lib/supabase/client";

interface CurrentUserAccessState {
  role: string | null;
  is_admin: boolean | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  suspended_until: string | null;
  suspension_reason: string | null;
}

export async function checkUserModeration() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .rpc("get_current_user_access_state")
    .maybeSingle<CurrentUserAccessState>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  if (data.is_banned) {
    throw new Error(
      "Akun Anda telah diblokir permanen.",
    );
  }

  if (
    data.is_suspended &&
    data.suspended_until &&
    new Date(
      data.suspended_until,
    ) > new Date()
  ) {
    throw new Error(
      `Akun Anda disuspend hingga ${new Date(
        data.suspended_until,
      ).toLocaleDateString("id-ID")}`,
    );
  }

  return data;
}