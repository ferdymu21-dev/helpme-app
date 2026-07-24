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

        return "Masukkan nominal donasi.";

    }

    if (

        amount <= 0

    ) {

        return "Masukkan nominal donasi.";

    }

    if (

        amount <

        PAYMENT_LIMIT.MIN_DONATION

    ) {

        return `Minimum donasi adalah Rp${PAYMENT_LIMIT.MIN_DONATION.toLocaleString("id-ID")}`;

    }

    if (

        amount >

        PAYMENT_LIMIT.MAX_DONATION

    ) {

        return `Maksimum donasi adalah Rp${PAYMENT_LIMIT.MAX_DONATION.toLocaleString("id-ID")}`;

    }

    return null;

}