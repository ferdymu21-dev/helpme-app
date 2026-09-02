"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { recordCampaignClickService } from "@/features/campaigns/services";

export async function recordNotificationClickAction(notificationId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return recordCampaignClickService(notificationId, user.id);
}