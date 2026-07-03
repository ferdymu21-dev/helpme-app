import {
    supabase,
} from "@/lib/supabase/client";

import type {
    DonationResponse,
} from "@/lib/payments/types/donation";

export async function createDonation(

    amount: number

): Promise<DonationResponse>

{

    const {

        data: {

            session,

        },

    }

    =

    await supabase.auth.getSession();

    if (

        !session

    ) {

        throw new Error(

            "User is not authenticated."

        );

    }

    const response =

        await fetch(

            "/api/payments/donate",

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json",

                    Authorization:

                        `Bearer ${session.access_token}`,

                },

                body: JSON.stringify({

                    amount,

                }),

            }

        );

    if (

        !response.ok

    ) {

        const error =

            await response.json();

        throw new Error(

            error.message

        );

    }

    return await response.json();

}