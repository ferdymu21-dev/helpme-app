import {
    findScheduledCampaignsRepository,
} from "../repositories";

import {
    publishCampaignEngine,
} from "../engines/publishCampaign.engine";

export interface RunScheduledCampaignsResult {

    scanned: number;

    published: number;

    failed: number;

}

export async function runScheduledCampaignsService():

    Promise<RunScheduledCampaignsResult> {

    const campaigns =
    await findScheduledCampaignsRepository();

    let published = 0;

    let failed = 0;

    for (const campaign of campaigns) {

        try {

            await publishCampaignEngine(
                campaign.id,
            );

            published++;

        }

        catch (error) {

            console.error(

                "[CAMPAIGN SCHEDULER]",

                campaign.id,

                error,

            );

            failed++;

        }

    }

    return {

        scanned: campaigns.length,

        published,

        failed,

    };

}