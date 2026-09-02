import type {
  NotificationCampaign,
} from "../types/campaign.types";

import {
  resolveCampaignRecipients,
} from "../resolvers/resolveCampaignRecipients";

import {
  dispatchCampaignNotification,
} from "../dispatchers";

import {
  syncCampaignSentStatisticRepository,
} from "../repositories/syncCampaignSentStatistic.repository";

export async function broadcastCampaignService(
  campaign: NotificationCampaign,
) {
  const recipients =
    await resolveCampaignRecipients(
      campaign,
    );

  for (
    const recipient
    of recipients
  ) {
    await dispatchCampaignNotification({
      campaign,

      userId:
        recipient.id,
    });
  }

  /*
   * Jangan increment berdasarkan
   * recipients.length karena retry
   * dapat mempunyai campuran
   * notification existing + baru.
   *
   * Reconcile dengan canonical
   * notification rows.
   */
  await syncCampaignSentStatisticRepository(
    campaign.id,
  );
}