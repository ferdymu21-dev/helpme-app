import { CampaignAction } from "../constants/campaign-action";

import { CampaignStatus } from "../constants/campaign-status";

import type { CampaignActionValue } from "../constants/campaign-action";

import type { CampaignStatusValue } from "../constants/campaign-status";

export function mapCampaignToAction(
    status: CampaignStatusValue,
): CampaignActionValue {

    switch (status) {

        case CampaignStatus.DRAFT:
            return CampaignAction.DRAFT;

        case CampaignStatus.SCHEDULED:
            return CampaignAction.SCHEDULE;

        default:
            return CampaignAction.PUBLISH;
    }
}