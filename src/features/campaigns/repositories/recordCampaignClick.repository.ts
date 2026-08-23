import { adminSupabase } from "@/lib/supabase/admin";

export async function recordCampaignClickRepository(
  notificationId: string,
) {
  // ambil notification
  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .select("campaign_id,user_id")
    .eq("id", notificationId)
    .single();

  if (error) throw error;

  if (!notification?.campaign_id) {
    return;
  }

  // anti double click
  const { data: exists } = await adminSupabase
    .from("notification_campaign_events")
    .select("id")
    .eq("notification_id", notificationId)
    .eq("event_type", "CLICKED")
    .maybeSingle();

  if (exists) {
    return;
  }

  // simpan event
  const { error: insertError } = await adminSupabase
    .from("notification_campaign_events")
    .insert({
      campaign_id: notification.campaign_id,
      notification_id: notificationId,
      user_id: notification.user_id,
      event_type: "CLICKED",
    });

  if (insertError) throw insertError;

  // ambil statistik
  const { data: campaign, error: campaignError } =
    await adminSupabase
      .from("notification_campaigns")
      .select("total_clicked")
      .eq("id", notification.campaign_id)
      .single();

  if (campaignError) throw campaignError;

  // update statistik
  const { error: updateError } =
    await adminSupabase
      .from("notification_campaigns")
      .update({
        total_clicked:
          (campaign.total_clicked ?? 0) + 1,
      })
      .eq("id", notification.campaign_id);

  if (updateError) throw updateError;
}