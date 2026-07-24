"use client";

import {
    usePaymentHistory,
} from "@/features/payments/hooks/usePaymentHistory";

export default function PaymentPage() {

    const {
        history,
        loading,
        error,
    } = usePaymentHistory();

    if (
        loading

    ) {

        return (

            <p>

                Loading...

            </p>

        );

    }

    if (

        error

    ) {

        return (

            <p>

                {error}

            </p>

        );

    }

    return (

        <pre>

            {

                JSON.stringify(

                    history,

                    null,

                    2

                )

            }

        </pre>

    );

}