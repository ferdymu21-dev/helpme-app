import {
    supabase,
} from "@/lib/supabase/client";

import type {
    DonationResponse,
} from "@/lib/payments/types/donation";

import type {
    CreatePaymentPayload,
    CreatePaymentResponse,
} from "../types/payment";

export async function createPayment(
    payload: CreatePaymentPayload
): Promise<CreatePaymentResponse> {

    const {
        data: {
            session,
        },
    } = await supabase.auth.getSession();

    if (!session) {

        throw new Error(
            "User is not authenticated."
        );

    }

    const response = await fetch(

        "/api/payments/create",

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${session.access_token}`,

            },

            body: JSON.stringify(payload),

        }

    );

    if (!response.ok) {

        const error =
            await response.json();

        throw new Error(
            error.message
        );

    }

    return await response.json();

}

export async function createDonation(

    amount: number

): Promise<DonationResponse> {

    return await createPayment({

        paymentType: "DONATION",

        amount,

    });

}