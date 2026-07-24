import {
    CampaignStatus,
} from "../constants/campaign-status";

import {
    changeCampaignStatusService,
} from "./changeCampaignStatus.service";

export async function publishCampaignService(

    campaignId: string,

) {

    await changeCampaignStatusService({

        campaignId,

        status:
            CampaignStatus.PUBLISHED,

    });

}