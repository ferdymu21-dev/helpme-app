import { createNotificationServer } from "@/features/notifications/server";

import type { NotificationCampaign } from "../types/campaign.types";

import { CampaignEvent } from "../constants/campaign-event";

import { createCampaignEventService } from "../services";

interface DispatchCampaignNotificationParams {
  campaign: NotificationCampaign;

  userId: string;
}

export async function dispatchCampaignNotification({
  campaign,
  userId,
}: DispatchCampaignNotificationParams) {

  const notification = await createNotificationServer({
    userId,

    title: campaign.title,

    message: campaign.message,

    type: campaign.type,

    campaignId: campaign.id,

    imageUrl: campaign.image_url ?? undefined,

    redirectUrl: campaign.redirect_url ?? undefined,
  });

  await createCampaignEventService({
    campaignId: campaign.id,

    notificationId: notification.id,

    userId,

    eventType: CampaignEvent.SENT,
  });

  return notification;
}