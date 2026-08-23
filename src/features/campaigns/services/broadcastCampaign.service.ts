import type { NotificationCampaign } from "../types/campaign.types";

import { resolveCampaignRecipients } from "../resolvers/resolveCampaignRecipients";

import { dispatchCampaignNotification } from "../dispatchers";

import { incrementCampaignStatistic } from "../repositories";

export async function broadcastCampaignService(campaign: NotificationCampaign) {
  const recipients = await resolveCampaignRecipients(campaign);

  if (recipients.length === 0) {
    return;
  }

  for (const recipient of recipients) {
    await dispatchCampaignNotification({
      campaign,

      userId: recipient.id,
    });
  }

  await incrementCampaignStatistic(
    campaign.id,

    {
      totalSent: recipients.length,
    },
  );
}