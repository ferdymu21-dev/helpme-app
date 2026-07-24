import {
    CampaignStatus,
} from "../constants/campaign-status";

import type {
    ChangeCampaignStatusPayload,
} from "../types/change-campaign-status.types";

import {
    getCampaignByIdRepository,
    updateCampaignStatusRepository,
} from "../repositories";

import {
    validateCampaignTransition,
} from "../validators";

export async function changeCampaignStatusService({

    campaignId,

    status,

}: ChangeCampaignStatusPayload) {

    const campaign =
        await getCampaignByIdRepository(
            campaignId,
        );

    validateCampaignTransition(

        campaign.status,

        status,

    );

    const values: Record<
        string,
        unknown
    > = {};

    if (

        status ===
        CampaignStatus.PUBLISHED &&

        !campaign.published_at

    ) {

        values.published_at =
            new Date().toISOString();

    }

    await updateCampaignStatusRepository(

        campaignId,

        status,

        values,

    );

}