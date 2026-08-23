import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignEventValue } from "../constants/campaign-event";

interface Params {
  campaignId: string;

  notificationId: string;

  eventType: CampaignEventValue;
}

export async function hasCampaignEvent({
  campaignId,
  notificationId,
  eventType,
}: Params): Promise<boolean> {
  const { data, error } = await adminSupabase
    .from("notification_campaign_events")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("notification_id", notificationId)
    .eq("event_type", eventType)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}