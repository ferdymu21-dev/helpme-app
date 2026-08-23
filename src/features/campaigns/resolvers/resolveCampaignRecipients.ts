import type { NotificationCampaign } from "../types/campaign.types";

import { findCampaignRecipientsRepository } from "../repositories";

export async function resolveCampaignRecipients(
  campaign: NotificationCampaign,
) {
  return findCampaignRecipientsRepository({
    targetType: campaign.target_type,

    targetValue: campaign.target_value,
  });
}