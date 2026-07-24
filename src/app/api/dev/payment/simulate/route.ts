import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    handlePaymentNotification,
} from "@/lib/payments/server";

import type {
    MidtransNotification,
} from "@/lib/payments/server";

export async function POST(

    request: NextRequest

) {

    if (

        process.env.NODE_ENV === "production"

    ) {

        return NextResponse.json(

            {

                message:

                    "Not Found",

            },

            {

                status: 404,

            }

        );

    }

    try {

        const notification =

            (await request.json()) as MidtransNotification;

        const result =

            await handlePaymentNotification(

                notification

            );

        return NextResponse.json(

            result

        );

    }

    catch (

        error

    ) {

        console.error(

            error

        );

        return NextResponse.json(

            {

                success: false,

                message:

                    error instanceof Error

                        ? error.message

                        : "Unknown Error",

            },

            {

                status: 500,

            }

        );

    }

}