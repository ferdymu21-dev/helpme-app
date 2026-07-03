import {

    adminSupabase,

}

from "@/lib/supabase/admin";

interface UpdateDonationPayload {

    orderId: string;

    paymentStatus: string;

    transactionId: string;

    paymentMethod: string;

    paidAt?: string;

    expiredAt?: string;

}

export async function updateDonationPayment(

    payload: UpdateDonationPayload

) {

    const {

        error,

    }

    =

    await adminSupabase

        .from(

            "support_donations"

        )

        .update({

            payment_status:

                payload.paymentStatus,

            midtrans_transaction_id:

                payload.transactionId,

            payment_method:

                payload.paymentMethod,

            paid_at:

                payload.paidAt ?? null,

            expired_at:

                payload.expiredAt ?? null,

        })

        .eq(

            "midtrans_order_id",

            payload.orderId

        );

    if (

        error

    ) {

        throw error;

    }

}