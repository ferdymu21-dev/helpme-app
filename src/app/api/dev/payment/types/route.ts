import {
    NextResponse,
} from "next/server";

import {
    getPaymentTypesForSimulator,
} from "@/lib/payments/server";

export async function GET() {

    if (
        process.env.NODE_ENV === "production"
    ) {

        return NextResponse.json(
            {
                message: "Not Found",
            },
            {
                status:404,
            }
        );

    }

    try {

        const types =
            await getPaymentTypesForSimulator();

        return NextResponse.json(
            types
        );

    }

    catch(error){

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unknown Error",
            },
            {
                status:500,
            }
        );

    }

}