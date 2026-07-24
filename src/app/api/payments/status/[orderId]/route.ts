import {
    NextResponse,
} from "next/server";

import {
    paymentStatusController,
} from "@/features/payments/controllers/paymentStatus.controller";

interface Context {

    params: Promise<{

        orderId: string;

    }>;

}

export async function GET(

    request: Request,

    { params }: Context,

) {

    try {

        const {

            orderId,

        }

        =

        await params;

        const result =

            await paymentStatusController(

                orderId,

            );

        return NextResponse.json(

            result,

        );

    }

    catch (

        error

    ) {

        return NextResponse.json(

            {

                message:

                    error instanceof Error

                        ? error.message

                        : "Unknown Error",

            },

            {

                status: 400,

            },

        );

    }

}