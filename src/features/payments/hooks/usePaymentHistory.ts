"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    fetchPaymentHistory,
} from "../services/paymentHistory.service";

export interface PaymentHistoryItem {

    id: string;

    amount: number;

    payment_status: string;

    payment_method: string;

    midtrans_order_id: string;

    created_at: string;

    paid_at: string | null;

}

export function usePaymentHistory() {

    const [

        history,

        setHistory,

    ]

    =

    useState<PaymentHistoryItem[]>([]);

    const [

        loading,

        setLoading,

    ]

    =

    useState(true);

    const [

        error,

        setError,

    ]

    =

    useState<string | null>(

        null

    );

    async function loadHistory() {

        try {

            setLoading(

                true

            );

            const result =

                await fetchPaymentHistory();

            setHistory(

                result

            );

        }

        catch (

            error

        ) {

            setError(

                error instanceof Error

                    ? error.message

                    : "Unknown Error"

            );

        }

        finally {

            setLoading(

                false

            );

        }

    }

    useEffect(

        () => {

            loadHistory();

        },

        []

    );

    return {

        history,

        loading,

        error,

        reload:

            loadHistory,

    };

}