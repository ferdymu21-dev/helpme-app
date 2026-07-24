import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    findPaymentsForSimulator,
} from "@/lib/payments/server";

export async function GET(
    request: NextRequest
) {

    if (
        process.env.NODE_ENV === "production"
    ) {

        return NextResponse.json(
            {
                message: "Not Found",
            },
            {
                status: 404,
            }
        );

    }

    try {

        const paymentType =
            request.nextUrl.searchParams.get(
                "paymentType"
            ) ?? undefined;

        const payments =
            await findPaymentsForSimulator(
                paymentType
            );

        return NextResponse.json(
            payments
        );

    }

    catch (error) {

        console.error(error);

        return NextResponse.json(
            {
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