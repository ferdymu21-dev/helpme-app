import {
    CampaignStatus,
} from "../constants/campaign-status";

import {
    buildCampaignBase,
} from "./buildCampaignBase";

import type {
    CreateCampaignPayload,
    InsertCampaignPayload,
} from "../types/campaign.types";

export function buildPublishedCampaign(

    payload: CreateCampaignPayload,

): InsertCampaignPayload {

    return {

        ...buildCampaignBase(payload),

        status: CampaignStatus.PUBLISHED,

        scheduled_at: null,

        published_at:
            new Date().toISOString(),

    };

}