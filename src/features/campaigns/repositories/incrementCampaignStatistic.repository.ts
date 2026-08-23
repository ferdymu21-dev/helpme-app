import { adminSupabase } from "@/lib/supabase/admin";

interface IncrementCampaignStatisticPayload {
  totalSent?: number;

  totalOpened?: number;

  totalClicked?: number;
}

export async function incrementCampaignStatistic(
  campaignId: string,

  payload: IncrementCampaignStatisticPayload,
) {
  const {
    data: campaign,

    error,
  } = await adminSupabase

    .from("notification_campaigns")

    .select(
      `
            total_sent,
            total_opened,
            total_clicked
        `,
    )

    .eq("id", campaignId)

    .single();

  if (error) {
    throw error;
  }

  const { error: updateError } = await adminSupabase

    .from("notification_campaigns")

    .update({
      total_sent: campaign.total_sent + (payload.totalSent ?? 0),

      total_opened: campaign.total_opened + (payload.totalOpened ?? 0),

      total_clicked: campaign.total_clicked + (payload.totalClicked ?? 0),
    })

    .eq("id", campaignId);

  if (updateError) {
    throw updateError;
  }
}