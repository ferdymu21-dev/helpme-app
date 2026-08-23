import type { CampaignEventValue } from "../constants/campaign-event";

export interface CampaignEventRecord {
  id: string;

  campaign_id: string;

  notification_id: string;

  user_id: string;

  event_type: CampaignEventValue;

  created_at: string;
}

export interface CreateCampaignEventPayload {
  campaignId: string;

  notificationId: string;

  userId: string;

  eventType: CampaignEventValue;
}