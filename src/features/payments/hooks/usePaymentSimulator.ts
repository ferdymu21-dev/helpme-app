"use client";

import {
    simulateWebhook,
} from "../services/paymentSimulator.service";

import {
    generateSimulatorOrderId,
    generateSimulatorTransactionId,
} from "../utils/simulator.generator";

import {
    validateSimulatorAmount,
    validateSimulatorOrderId,
} from "../utils/simulator.validator";

import type {
    SimulatorResult,
} from "../types/simulatorResult";

import {
    useEffect,
    useState,
} from "react";

import {
    copyToClipboard,
} from "../utils/clipboard";

import type {
    SimulationHistoryItem,
} from "../types/simulationHistory";

export function usePaymentSimulator() {

    const [
        orderId,
        setOrderId,
    ] = useState(
        () =>
            generateSimulatorOrderId(
                "DONATION"
            )
    );

    const [

        amount,

        setAmount,

    ] = useState("5000");



    const [

        transactionType,

        setTransactionType,

    ] = useState("DONATION");



    const [

        paymentMethod,

        setPaymentMethod,

    ] = useState("QRIS");



    const [

        transactionStatus,

        setTransactionStatus,

    ] = useState("SETTLEMENT");



    const [

        transactionId,

        setTransactionId,

    ] = useState(

        generateSimulatorTransactionId()

    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        result,
        setResult,
    ] 
    =
        useState<SimulatorResult>({
            status:
                "PENDING",
            response:
                "",
            executionTime:
                0,
        });

    const [

        history,

        setHistory,

    ]

        =

        useState<

            SimulationHistoryItem[]

        >([]);

    useEffect(

        () => {

            setOrderId(

                generateSimulatorOrderId(

                    transactionType

                )

            );

        },

        [

            transactionType,

        ]

    );

    function generateNewIds() {

        setOrderId(

            generateSimulatorOrderId(

                transactionType

            )

        );

        setTransactionId(

            generateSimulatorTransactionId()

        );

        setResult({

            status: "PENDING",

            response: "",

            executionTime: 0,

        });

    }

    async function copyPayload() {

        const payload = {

            orderId,

            transactionId,

            transactionType,

            paymentMethod,

            transactionStatus,

            amount,

        };

        await copyToClipboard(

            JSON.stringify(

                payload,

                null,

                2

            )

        );

    }

    async function copyResponse() {
        if (
            !result.response
        ) {
            return;
        }
        await copyToClipboard(
            result.response
        );
    }

    async function handleSubmit() {

        try {

            const startedAt =

                performance.now();

            const amountError =

                validateSimulatorAmount(

                    amount

                );

            if (

                amountError

            ) {

                setResult({

                    status: "ERROR",

                    response: amountError,

                    executionTime: 0,

                });

                return;

            }

            const orderIdError =

                validateSimulatorOrderId(

                    orderId

                );

            if (

                orderIdError

            ) {

                setResult({

                    status: "ERROR",

                    response: orderIdError,

                    executionTime: 0,

                });

                return;

            }

            setResult({

                status: "PENDING",

                response: "",

                executionTime: 0,

            });

            setLoading(true);

            const simulationResult =

                await simulateWebhook({

                    orderId,

                    amount:

                        Number(amount),

                    paymentMethod,

                    transactionStatus,

                    transactionId,

                });

            const finishedAt =

                performance.now();

            setResult({

                status:

                    "SUCCESS",

                response:

                    JSON.stringify(

                        simulationResult,

                        null,

                        2

                    ),

                executionTime:

                    Math.round(

                        finishedAt -

                        startedAt

                    ),

            });

            setHistory(

    previous => [

        {

            id:

                crypto.randomUUID(),

            createdAt:

                new Date(),

            orderId,

            amount:

                Number(amount),

            result: {

                status:

                    "SUCCESS" as const,

                response:

                    JSON.stringify(

                        simulationResult,

                        null,

                        2

                    ),

                executionTime:

                    Math.round(

                        finishedAt -

                        startedAt

                    ),

            },

        },

        ...previous,

    ].slice(0, 10)

);

        }

        catch (error) {

            if (

                error instanceof Error

            ) {

                setResult({

                    status: "ERROR",

                    response: error.message,

                    executionTime: 0,

                });

            }

        }

        finally {

            setLoading(false);

        }

    }

    return {

        orderId,

        amount,

        transactionType,

        paymentMethod,

        transactionStatus,

        transactionId,

        loading,

        result,

        setOrderId,

        setAmount,

        setTransactionType,

        setPaymentMethod,

        setTransactionStatus,

        handleSubmit,

        generateNewIds,

        copyPayload,

        copyResponse,

        history,

    };

}