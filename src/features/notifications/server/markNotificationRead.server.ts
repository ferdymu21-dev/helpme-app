import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignEvent } from "@/features/campaigns/constants/campaign-event";

import { createCampaignEventService } from "@/features/campaigns/services";

import {
  incrementCampaignStatistic,
  hasCampaignEvent,
} from "@/features/campaigns/repositories";

export async function markNotificationReadServer(notificationId: string) {
  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (error) throw error;

  if (!notification) {
    throw new Error("Notification tidak ditemukan.");
  }

  if (!notification.is_read) {
    if (notification.campaign_id) {
      const opened = await hasCampaignEvent({
        campaignId: notification.campaign_id,
        notificationId: notification.id,
        eventType: CampaignEvent.OPENED,
      });

      if (!opened) {
        await createCampaignEventService({
          campaignId: notification.campaign_id,
          notificationId: notification.id,
          userId: notification.user_id,
          eventType: CampaignEvent.OPENED,
        });

        await incrementCampaignStatistic(notification.campaign_id, {
          totalOpened: 1,
        });
      }
    }
    const { error: updateError } = await adminSupabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    if (updateError) throw updateError;
  }

  return notification;
}