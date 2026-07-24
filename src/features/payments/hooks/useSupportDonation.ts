"use client";

import {
    useState,
} from "react";

import {
    createDonation,
} from "../services/payment.service";

export function useSupportDonation() {

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(

        null

    );

    async function donate(

        amount: number

    ) {

        try {

            setLoading(true);

            setError(null);

            const result =

                await createDonation(

                    amount

                );

            return result;

        }

        catch (err) {

            if (

                err instanceof Error

            ) {

                setError(

                    err.message

                );

            }

            throw err;

        }

        finally {

            setLoading(false);

        }

    }

    return {

        donate,

        loading,

        error,

    };

}