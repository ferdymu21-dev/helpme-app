import { adminSupabase } from "@/lib/supabase/admin";

import type { InsertCampaignPayload } from "../types/campaign.types";

export async function createCampaignRepository(
  campaign: InsertCampaignPayload,
) {
  
  const {
    data,

    error,
  } = await adminSupabase

    .from("notification_campaigns")

    .insert(campaign)

    .select()

    .single();

  if (error) {
    throw error;
  }

  return data;
}