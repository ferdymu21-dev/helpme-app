import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

import {
    paymentHistoryController,
} from "@/features/payments/controllers/paymentHistory.controller";

export async function GET(

    request: NextRequest

) {

    try {

        const supabase =

            await createServerSupabaseClient();

        const {

            data: {

                user,

            },

        } = await supabase.auth.getUser();

        if (

            !user

        ) {

            return NextResponse.json(

                {

                    message:

                        "Unauthorized",

                },

                {

                    status: 401,

                },

            );

        }

        const searchParams =

            request.nextUrl.searchParams;

        const cursor =

            searchParams.get(

                "cursor",

            )

            ||

            undefined;

        const limit = Number(

            searchParams.get(

                "limit",

            )

            ||

            10,

        );

        const history =

            await paymentHistoryController(

                user.id,

                cursor,

                limit,

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