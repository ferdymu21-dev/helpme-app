import {
    CampaignAction,
} from "../constants/campaign-action";

import {
    buildDraftCampaign,
    buildPublishedCampaign,
    buildScheduledCampaign,
} from "../factories";

import {
    createCampaignRepository,
} from "../repositories";

import {
    validateCreateCampaign,
} from "../validators";

import type {
    CreateCampaignPayload,
} from "../types/campaign.types";

export async function createCampaignService(

    payload: CreateCampaignPayload,

) {

    validateCreateCampaign(payload);

    switch (payload.action) {

        case CampaignAction.DRAFT:

            return createCampaignRepository(

                buildDraftCampaign(payload)

            );

        case CampaignAction.PUBLISH:

            return createCampaignRepository(

                buildPublishedCampaign(payload)

            );

        case CampaignAction.SCHEDULE:

            return createCampaignRepository(

                buildScheduledCampaign(payload)

            );

        default:

            throw new Error(

                "Campaign action tidak dikenali."

            );

    }

}