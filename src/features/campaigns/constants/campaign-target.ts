export const CampaignTarget = {

    ALL: "ALL",

    USER: "USER",

    HELPER: "HELPER",

    VERIFIED: "VERIFIED",

    UNVERIFIED: "UNVERIFIED",

    CITY: "CITY",

    RADIUS: "RADIUS",

} as const;

export type CampaignTargetValue =

    typeof CampaignTarget[
        keyof typeof CampaignTarget
    ];