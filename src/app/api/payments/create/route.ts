import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

import {
    createPaymentController,
} from "@/features/payments/controllers/payment.controller";

import type {
    CreatePaymentPayload,
} from "@/features/payments/types/payment";

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

        const payload: CreatePaymentPayload = {

            paymentType:
                body.paymentType,

            amount:
                body.amount,

            metadata:
                body.metadata,

        };

        const result =
            await createPaymentController({

                ...payload,

                userId: user.id,

            });

        return NextResponse.json(

            result,

            {

                status: 201,

            }

        );

    }

    catch (error) {

        console.error(
            "PAYMENT API ERROR:",
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