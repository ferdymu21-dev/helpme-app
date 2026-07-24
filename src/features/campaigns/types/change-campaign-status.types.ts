import type {
    CampaignStatusValue,
} from "../constants/campaign-status";

export interface ChangeCampaignStatusPayload {

    campaignId: string;

    status: CampaignStatusValue;

}