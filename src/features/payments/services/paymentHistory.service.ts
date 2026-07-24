import {
    supabase,
} from "@/lib/supabase/client";

export async function fetchPaymentHistory() {

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

            "/api/payments/history",

            {

                method: "GET",

                headers: {

                    Authorization:

                        `Bearer ${session.access_token}`,

                },

            },

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