import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignEvent } from "../constants/campaign-event";

export type CampaignEngagementEvent =
  | typeof CampaignEvent.OPENED
  | typeof CampaignEvent.CLICKED;

interface RecordCampaignEngagementEventInput {
  notificationId: string;
  userId: string;
  eventType: CampaignEngagementEvent;
}

export async function recordCampaignEngagementEventRepository({
  notificationId,
  userId,
  eventType,
}: RecordCampaignEngagementEventInput): Promise<boolean> {
  const { data, error } = await adminSupabase.rpc(
    "record_campaign_notification_event",
    {
      p_notification_id: notificationId,
      p_user_id: userId,
      p_event_type: eventType,
    },
  );

  if (error) {
    throw error;
  }

  return data === true;
}