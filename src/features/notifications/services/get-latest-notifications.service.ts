import { supabase }
from "@/lib/supabase/client";

export async function getLatestNotifications() {

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user)
    return [];

  const {
    data,
    error,
  } =
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5);

  if (error)
    throw error;

  return data ?? [];

}