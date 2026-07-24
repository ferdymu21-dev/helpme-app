import {
    CampaignStatus,
    CampaignStatusValue,
} from "./campaign-status";

export const CampaignTransition: Record<
    CampaignStatusValue,
    CampaignStatusValue[]
> = {

    [CampaignStatus.DRAFT]: [
        CampaignStatus.SCHEDULED,
        CampaignStatus.PUBLISHED,
        CampaignStatus.CANCELLED,
    ],

    [CampaignStatus.SCHEDULED]: [
        CampaignStatus.PUBLISHED,
        CampaignStatus.CANCELLED,
    ],

    [CampaignStatus.PUBLISHED]: [
        CampaignStatus.FINISHED,
    ],

    [CampaignStatus.FINISHED]: [],

    [CampaignStatus.CANCELLED]: [],

};