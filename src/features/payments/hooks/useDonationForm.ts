"use client";

import {
    useState,
} from "react";

import {
    validateDonationAmount,
} from "../validators/donation.validator";

export function useDonationForm() {

    const [
        selectedAmount,
        setSelectedAmount,
    ]
        =
        useState(
            5000
        );

    const [
        customAmount,
        setCustomAmount,
    ]
        =
        useState(
            "5000"
        );



    function handleSelectAmount(

        amount: number

    ) {

        setSelectedAmount(

            amount

        );

        setCustomAmount(

            amount.toString()

        );

    }

    function handleCustomAmountChange(

        value: string

    ) {

        setCustomAmount(

            value

        );

        const amount =

            Number(

                value

            );

        if (

            Number.isNaN(

                amount

            )

        ) {

            setSelectedAmount(

                0

            );

            return;

        }

        setSelectedAmount(

            amount

        );

    }

    const finalAmount =

        Number(

            customAmount

        );

    const error =

        validateDonationAmount(

            finalAmount

        );

    const isValid =

        error === null;

    return {

        selectedAmount,
        customAmount,
        finalAmount,
        error,
        isValid,

        handleSelectAmount,
        handleCustomAmountChange,

    };

}