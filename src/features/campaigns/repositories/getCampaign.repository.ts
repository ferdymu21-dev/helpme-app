import { adminSupabase } from "@/lib/supabase/admin";

import type { NotificationCampaign } from "../types/campaign.types";

export async function getCampaignRepository(
  id: string,
): Promise<NotificationCampaign> {
  const {
    data,

    error,
  } = await adminSupabase

    .from("notification_campaigns")

    .select("*")

    .eq("id", id)

    .single();

  if (error) {
    throw error;
  }

  return data;
}