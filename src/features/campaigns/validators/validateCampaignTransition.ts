import {
    CampaignTransition,
} from "../constants/campaign-transition";

import type {
    CampaignStatusValue,
} from "../constants/campaign-status";

export function validateCampaignTransition(

    currentStatus: CampaignStatusValue,

    nextStatus: CampaignStatusValue,

): void {

    const allowedTransitions =

        CampaignTransition[currentStatus];

    if (

        !allowedTransitions.includes(nextStatus)

    ) {

        throw new Error(

            `Campaign tidak dapat berpindah dari ${currentStatus} ke ${nextStatus}.`

        );

    }

}