"use client";

import {
    createPayment as createPaymentService,
} from "../services/payment.service";

import type {
    CreatePaymentPayload,
} from "../types/payment";

export function usePayment() {

    async function createPayment(
        payload: CreatePaymentPayload
    ) {

        return await createPaymentService(
            payload
        );

    }

    // Backward compatibility
    async function donate(
        amount: number
    ) {

        return await createPayment({

            paymentType: "DONATION",

            amount,

        });

    }

    return {

        createPayment,

        donate,

    };

}