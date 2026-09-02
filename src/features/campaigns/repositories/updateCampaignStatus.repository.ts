import { adminSupabase } from "@/lib/supabase/admin";

import type { CampaignStatusValue } from "../constants/campaign-status";

export async function updateCampaignStatusRepository(
  campaignId: string,

  status: CampaignStatusValue,

  values: Record<string, unknown>,

  expectedStatus: CampaignStatusValue,
): Promise<boolean> {
  const { data, error } = await adminSupabase
    .from("notification_campaigns")
    .update({
      status,

      updated_at: new Date().toISOString(),

      ...values,
    })
    .eq("id", campaignId)
    .eq("status", expectedStatus)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}