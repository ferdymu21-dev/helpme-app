"use client";

import {
    useCallback,
    useState,
} from "react";

import type {
    PaymentResult,
    PaymentResultStatus,
} from "../types/paymentResult";

export function usePaymentResult() {

    const [

        result,

        setResult,

    ] = useState<PaymentResult>({

        status: "IDLE",

        orderId: "",

        amount: 0,

    });

    const openResult = useCallback(

        (

            status: PaymentResultStatus,

            orderId: string,

            amount: number,

        ) => {

            setResult({

                status,

                orderId,

                amount,

            });

        },

        []

    );

    const closeResult = useCallback(

        () => {

            setResult({

                status: "IDLE",

                orderId: "",

                amount: 0,

            });

        },

        []

    );

    return {

        result,

        openResult,

        closeResult,

    };

}