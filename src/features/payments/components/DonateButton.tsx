"use client";

import { useState } from "react";

import {
    useSupportDonation,
} from "../hooks/useSupportDonation";

import {
    useMidtrans,
} from "../hooks/useMidtrans";

import {
    usePaymentStatus,
} from "../hooks/usePaymentStatus";

import {
    useEffect,
} from "react";

import {
    usePaymentResult,
} from "../hooks/usePaymentResult";

import PaymentResultDialog
    from "./dialogs/PaymentResultDialog";

export default function DonateButton() {

    const {
        donate,
        loading,
    }
        =
        useSupportDonation();

    const {
        openPayment,
    } = useMidtrans();

    const [
        orderId,
        setOrderId,
    ] = useState("");

    const {
        status,
    } = usePaymentStatus({
        enabled:
            !!orderId,
        orderId,
    });

    const {

        result,

        openResult,

        closeResult,

    }

        =

        usePaymentResult();

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    useEffect(

        () => {

            if (

                !orderId

            ) {

                return;

            }

            switch (

            status

            ) {

                case "PAID":

                    openResult(

                        "SUCCESS",

                        orderId,

                        5000

                    );

                    break;

                case "FAILED":

                    openResult(

                        "FAILED",

                        orderId,

                        5000

                    );

                    break;

                case "EXPIRED":

                    openResult(

                        "EXPIRED",

                        orderId,

                        5000

                    );

                    break;

                default:

                    break;

            }

        },

        [

            status,

            orderId,

            openResult,

        ]

    );

    async function handleDonate() {

        try {

            setError(

                null

            );

            const payment =

                await donate(

                    5000

                );

            setOrderId(

                payment.orderId

            );

            console.log(

                "PAYMENT RESULT",

                payment

            );

            await openPayment(

                payment.snapToken

            );

        }

        catch (

        err

        ) {

            if (

                err instanceof Error

            ) {

                setError(

                    err.message

                );

            }

        }

    }

    return (

        <div className="space-y-3">

            <button

                onClick={

                    handleDonate

                }

                disabled={

                    loading

                }

                className="
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-3
                    font-semibold
                    text-white
                    hover:bg-indigo-700
                    disabled:opacity-50
                "

            >

                {

                    loading

                        ? "Memproses..."

                        : "Donasi Rp5.000"

                }

            </button>

            {

                error && (

                    <p className="text-sm text-red-600">

                        {error}

                    </p>

                )

            }

            <PaymentResultDialog

                open={

                    result.status !== "IDLE"

                }

                status={

                    result.status

                }

                amount={

                    result.amount

                }

                orderId={

                    result.orderId

                }

                onClose={

                    closeResult

                }

                onHistory={() => {

                    console.log(

                        "Go to Payment History"

                    );

                }}

            />

        </div>

    );

}