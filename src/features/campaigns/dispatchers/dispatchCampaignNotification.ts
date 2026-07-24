import {
    createNotificationServer,
} from "@/features/notifications/server";

import type {
    NotificationCampaign,
} from "../types/campaign.types";

interface DispatchCampaignNotificationParams {

    campaign: NotificationCampaign;

    userId: string;

}

export async function dispatchCampaignNotification({

    campaign,

    userId,

}: DispatchCampaignNotificationParams) {

    return createNotificationServer({

        userId,

        title: campaign.title,

        message: campaign.message,

        type: campaign.type,

        redirectUrl:

            campaign.redirect_url ?? undefined,

    });

}