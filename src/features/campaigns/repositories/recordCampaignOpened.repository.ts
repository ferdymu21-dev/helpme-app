import { adminSupabase } from "@/lib/supabase/admin";

import { incrementCampaignStatistic } from "./incrementCampaignStatistic.repository";

export async function recordCampaignOpened(
  notificationId: string,
) {
  // Ambil campaign dari notification
  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .select("campaign_id,user_id")
    .eq("id", notificationId)
    .single();

  if (error) throw error;

  if (!notification?.campaign_id) {
    return;
  }

  // Cek apakah OPENED sudah pernah dicatat
  const { data: exists } = await adminSupabase
    .from("notification_campaign_events")
    .select("id")
    .eq("notification_id", notificationId)
    .eq("event_type", "OPENED")
    .maybeSingle();

  if (exists) {
    return;
  }

  // Simpan event OPENED
  const { error: insertError } = await adminSupabase
    .from("notification_campaign_events")
    .insert({
      campaign_id: notification.campaign_id,
      notification_id: notificationId,
      user_id: notification.user_id,
      event_type: "OPENED",
    });

  if (insertError) throw insertError;

  // Tambah statistik campaign
  await incrementCampaignStatistic(
    notification.campaign_id,
    {
      totalOpened: 1,
    },
  );
}