"use client";

import {

    createDonationPayment,

}

from "@/lib/payments/client/payment.client";

export function usePayment() {

    async function donate(

        amount: number

    ) {

        return await

            createDonationPayment(

                amount

            );

    }

    return {

        donate,

    };

}