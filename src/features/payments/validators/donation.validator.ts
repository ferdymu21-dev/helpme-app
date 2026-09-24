import {
    PAYMENT_LIMIT,
} from "@/lib/payments/constants/payment";

export function validateDonationAmount(

    amount: number

): string | null {

    if (

        Number.isNaN(

            amount

        )

    ) {

        return "Masukkan nominal support.";

    }

    if (

        amount <= 0

    ) {

        return "Masukkan nominal support.";

    }

    if (

        amount <

        PAYMENT_LIMIT.MIN_DONATION

    ) {

        return `Minimum support adalah Rp${PAYMENT_LIMIT.MIN_DONATION.toLocaleString("id-ID")}`;

    }

    if (

        amount >

        PAYMENT_LIMIT.MAX_DONATION

    ) {

        return `Maksimum support adalah Rp${PAYMENT_LIMIT.MAX_DONATION.toLocaleString("id-ID")}`;

    }

    return null;

}