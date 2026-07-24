import { NextRequest, NextResponse } from "next/server";

import {
    runScheduledCampaignsService,
} from "@/features/campaigns/services";

export async function POST(

    request: NextRequest,

) {

    try {

        const authorization =

            request.headers.get(

                "authorization",

            );

        const secret =

            process.env.CAMPAIGN_CRON_SECRET;

        if (

            authorization !==

            `Bearer ${secret}`

        ) {

            return NextResponse.json(

                {

                    success: false,

                    message: "Unauthorized",

                },

                {

                    status: 401,

                },

            );

        }

        const result =

            await runScheduledCampaignsService();

        return NextResponse.json({

            success: true,

            ...result,

        });

    }

    catch (error) {

        console.error(

            "[CAMPAIGN SCHEDULER]",

            error,

        );

        return NextResponse.json(

            {

                success: false,

                message:

                    "Scheduler failed.",

            },

            {

                status: 500,

            },

        );

    }

}