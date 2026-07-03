"use client";

import { useState } from "react";

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

    function openResult(

        status: PaymentResultStatus,

        orderId: string,

        amount: number,

    ) {

        setResult({

            status,

            orderId,

            amount,

        });

    }

    function closeResult() {

        setResult({

            status: "IDLE",

            orderId: "",

            amount: 0,

        });

    }

    return {

        result,

        openResult,

        closeResult,

    };

}