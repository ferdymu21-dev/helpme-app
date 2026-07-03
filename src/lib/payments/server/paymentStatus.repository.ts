import {

    adminSupabase,

}

from "@/lib/supabase/admin";

export async function getPaymentStatus(

    orderId: string,

) {

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

            "payment_status"

        )

        .eq(

            "midtrans_order_id",

            orderId,

        )

        .single();

    if (

        error

    ) {

        throw error;

    }

    return data.payment_status;

}