import { adminSupabase } from "@/lib/supabase/admin";

import type { CreateCampaignEventPayload } from "../types/campaign-event.types";

export async function createCampaignEventRepository(
  payload: CreateCampaignEventPayload,
) {
  const { error } = await adminSupabase
    .from("notification_campaign_events")
    .insert({
      campaign_id: payload.campaignId,

      notification_id: payload.notificationId,

      user_id: payload.userId,

      event_type: payload.eventType,
    });

  if (error) {
    throw error;
  }
}