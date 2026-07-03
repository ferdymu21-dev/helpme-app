import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

import {
    createDonationController,
} from "@/features/payments/controllers/donation.controller";

import type {
    CreateDonationCommand,
} from "@/lib/payments/types/donation";

export async function POST(

    request: NextRequest

) {

    try {

        const authorization =

            request.headers.get(

                "authorization"

            );

        if (

            !authorization ||

            !authorization.startsWith(

                "Bearer "

            )

        ) {

            return NextResponse.json(

                {

                    message:

                        "Unauthorized",

                },

                {

                    status: 401,

                }

            );

        }

        const accessToken =

            authorization.replace(

                "Bearer ",

                ""

            );

        const user =

            await getCurrentUser(

                accessToken

            );

        const body =

            await request.json();

        const payload: CreateDonationCommand = {

            userId:

                user.id,

            amount:

                body.amount,

        };

        const result =

            await createDonationController(

                payload

            );

        return NextResponse.json(

            result,

            {

                status: 201,

            }

        );

    }

    catch (error) {

        console.error(
            "DONATION API ERROR:",
            error
        );

        return NextResponse.json(

            {

                message:

                    error instanceof Error

                        ? error.message

                        : "Internal Server Error",

            },

            {

                status: 500,

            }

        );

    }

}