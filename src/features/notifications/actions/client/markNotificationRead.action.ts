"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { markNotificationReadServer } from "../../server/markNotificationRead.server";

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  await markNotificationReadServer(
    notificationId,

    user.id,
  );
}