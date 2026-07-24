"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useSupportDonation,
} from "./useSupportDonation";

import {
    useMidtrans,
} from "./useMidtrans";

import {
    usePaymentStatus,
} from "./usePaymentStatus";

import {
    usePaymentResult,
} from "./usePaymentResult";

export function useDonationFlow() {

    const {

        donate,

        loading,

        error,

    } = useSupportDonation();

    const {

        openPayment,

    } = useMidtrans();

    const {

        result,

        openResult,

        closeResult,

    } = usePaymentResult();

    const [
        orderId,

        setOrderId

    ] = useState("");

    const [

        amount,

        setAmount,

    ] = useState(5000);

    const {

        status,

    } = usePaymentStatus({

        enabled: orderId !== "",

        orderId,

    });

    const handledResultRef = useRef(false);

    // ======================================================
    // Payment Lifecycle
    // ======================================================

    useEffect(() => {

        if (!orderId) {

            return;

        }

        if (handledResultRef.current) {

            return;

        }

        if (status === "PENDING") {

            return;

        }

        handledResultRef.current = true;

        switch (status) {

            case "PAID":

                openResult(

                    "SUCCESS",
                    orderId,
                    amount,
                );

                break;

            case "FAILED":

                openResult(

                    "FAILED",
                    orderId,
                    amount,
                );

                break;

            case "EXPIRED":

                openResult(

                    "EXPIRED",
                    orderId,
                    amount,
                );

                break;

            case "CANCELLED":

                openResult(
                    "FAILED",
                    orderId,
                    amount,
                );

                break;

            default:

                handledResultRef.current = false;

                break;

        }

    }, [

        status,

        orderId,

        amount,

        openResult,

    ]);

    // ======================================================
    // Donate Action
    // ======================================================

    async function handleDonate(

        donationAmount?: number,

    ) {

        handledResultRef.current = false;

        const finalAmount =

            donationAmount ??

            amount;

        setAmount(

            finalAmount

        );

        const payment =

            await donate(

                finalAmount

            );

        setOrderId(

            payment.orderId

        );

        await openPayment({

            snapToken: payment.snapToken,

            onSuccess() {

                // Status akan diambil dari server melalui polling.

            },

            onPending() {

                // Jangan tampilkan dialog.
                // Polling akan memantau perubahan status transaksi.

            },

            onError() {

                // Polling akan menentukan status akhir.

            },

            onClose() {

                // Sengaja kosong.
                // Polling usePaymentStatus akan menjadi fallback
                // apabila callback Midtrans tidak pernah diterima.

            },

        });

    }

    return {

        handleDonate,

        loading,

        error,

        result,

        closeDialog: closeResult,

    };

}

