import { adminSupabase } from "@/lib/supabase/admin";

import { incrementCampaignStatistic } from "./incrementCampaignStatistic.repository";

export async function recordCampaignClicked(notificationId: string) {
  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .select("campaign_id,user_id")
    .eq("id", notificationId)
    .single();

  if (error) throw error;

  if (!notification?.campaign_id) {
    return;
  }

  const { data: exists } = await adminSupabase
    .from("notification_campaign_events")
    .select("id")
    .eq("notification_id", notificationId)
    .eq("event_type", "CLICKED")
    .maybeSingle();

  if (exists) {
    return;
  }

  const { error: insertError } = await adminSupabase
    .from("notification_campaign_events")
    .insert({
      campaign_id: notification.campaign_id,
      notification_id: notificationId,
      user_id: notification.user_id,
      event_type: "CLICKED",
    });

  if (insertError) throw insertError;

  await incrementCampaignStatistic(notification.campaign_id, {
    totalClicked: 1,
  });
}