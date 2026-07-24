export const CampaignAction = {

    DRAFT: "DRAFT",

    PUBLISH: "PUBLISH",

    SCHEDULE: "SCHEDULE",

} as const;

export type CampaignActionValue =

    typeof CampaignAction[
        keyof typeof CampaignAction
    ];