import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

import {
    paymentHistoryController,
} from "@/features/payments/controllers/paymentHistory.controller";

export async function GET(

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

        const history =

            await paymentHistoryController(

                user.id

            );

        return NextResponse.json(

            history,

            {

                status: 200,

            }

        );

    }

    catch (

        error

    ) {

        console.error(

            "PAYMENT HISTORY ERROR:",

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