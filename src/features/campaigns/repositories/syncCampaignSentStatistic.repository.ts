import { adminSupabase } from "@/lib/supabase/admin";

export async function syncCampaignSentStatisticRepository(campaignId: string) {
  const { count, error } = await adminSupabase
    .from("notifications")
    .select("id", {
      count: "exact",

      head: true,
    })
    .eq("campaign_id", campaignId);

  if (error) {
    throw error;
  }

  const { error: updateError } = await adminSupabase
    .from("notification_campaigns")
    .update({
      total_sent: count ?? 0,

      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (updateError) {
    throw updateError;
  }
}