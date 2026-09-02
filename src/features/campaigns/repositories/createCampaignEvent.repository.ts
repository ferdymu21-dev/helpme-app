import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignEvent } from "../constants/campaign-event";

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

  /*
   * SENT merupakan delivery marker.
   *
   * Retry scheduler terhadap
   * notification yang sama harus
   * dianggap sukses, bukan membuat
   * SENT kedua.
   */
  if (error?.code === "23505" && payload.eventType === CampaignEvent.SENT) {
    return;
  }

  if (error) {
    throw error;
  }
}