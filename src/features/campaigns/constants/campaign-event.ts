export const CampaignEvent = {
  SENT: "SENT",

  OPENED: "OPENED",

  CLICKED: "CLICKED",

  FAILED: "FAILED",
} as const;

export type CampaignEventValue =
  (typeof CampaignEvent)[keyof typeof CampaignEvent];