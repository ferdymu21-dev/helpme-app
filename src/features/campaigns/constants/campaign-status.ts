export const CampaignStatus = {

    DRAFT: "DRAFT",

    SCHEDULED: "SCHEDULED",

    PUBLISHED: "PUBLISHED",

    FINISHED: "FINISHED",

    CANCELLED: "CANCELLED",

} as const;

export type CampaignStatusValue =

    typeof CampaignStatus[
        keyof typeof CampaignStatus
    ];