import {

    adminSupabase,

}

from "@/lib/supabase/admin";

export async function getPendingDonations() {

    const {

        data,

        error,

    }

    =

    await adminSupabase

        .from(

            "support_donations"

        )

        .select(

            `
            id,
            midtrans_order_id,
            amount,
            payment_status,
            created_at
            `
        )

        .eq(

            "payment_status",

            "PENDING"

        )

        .order(

            "created_at",

            {

                ascending: false,

            }

        );

    if (

        error

    ) {

        throw error;

    }

    return data;

}