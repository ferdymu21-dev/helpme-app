"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

export type PaymentStatus =

    | "PENDING"

    | "PAID"

    | "FAILED"

    | "EXPIRED"

    | "CANCELLED";

interface Options {

    enabled: boolean;

    orderId: string;

    interval?: number;

}

interface PaymentStatusResponse {

    status: PaymentStatus;

    paymentType: "DONATION" | "URGENT_TASK";

    taskId?: string | null;

}

export function usePaymentStatus({

    enabled,

    orderId,

    interval = 3000,

}: Options) {

    const [
        status,
        setStatus,
    ] = useState<PaymentStatus>("PENDING");

    const [
        paymentType,
        setPaymentType,
    ] = useState<string | null>(null);

    const [
        taskId,
        setTaskId,
    ] = useState<string | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const timerRef =

        useRef<NodeJS.Timeout | null>(

            null

        );

    const fetchStatus =

        useCallback(

            async () => {

                if (

                    !orderId

                ) {

                    return;

                }

                setLoading(

                    true

                );

                try {

                    const response =

                        await fetch(

                            `/api/payments/status/${orderId}`

                        );

                    if (

                        !response.ok

                    ) {

                        return;

                    }

                    const data =
                        await response.json();

                    console.log(
                        "[PaymentStatus API]",
                        data
                    );

                    console.log(
                        "[PaymentStatus Value]",
                        data.status
                    );

                    setStatus(
                        data.status
                    );

                    setPaymentType(
                        data.paymentType ?? null
                    );

                    setTaskId(
                        data.taskId ?? null
                    );

                }

                finally {

                    setLoading(

                        false

                    );

                }

            },

            [

                orderId,

            ]

        );

    useEffect(

        () => {

            if (

                !enabled ||

                !orderId

            ) {

                return;

            }

            fetchStatus();

            timerRef.current =

                setInterval(

                    fetchStatus,

                    interval

                );

            return () => {

                if (

                    timerRef.current

                ) {

                    clearInterval(

                        timerRef.current

                    );

                }

            };

        },

        [

            enabled,

            orderId,

            interval,

            fetchStatus,

        ]

    );

    useEffect(

        () => {

            if (

                status !==

                "PENDING"

            ) {

                if (

                    timerRef.current

                ) {

                    clearInterval(

                        timerRef.current

                    );

                }

            }

        },

        [

            status,

        ]

    );

    return {

        status,

        paymentType,

        taskId,

        loading,

        reload:

            fetchStatus,

    };

}