import {

    PAYMENT_LIMIT,

} from "../constants/payment";

export function validateDonationAmount(

    amount: number

) {

    if (

        amount <= 0

    ) {

        throw new Error(

            "Invalid support amount."

        );

    }

    if (

        amount <

        PAYMENT_LIMIT.MIN_DONATION

    ) {

        throw new Error(

            `Minimum support is Rp${PAYMENT_LIMIT.MIN_DONATION.toLocaleString("id-ID")}`

        );

    }

    if (

        amount >

        PAYMENT_LIMIT.MAX_DONATION

    ) {

        throw new Error(

            `Maximum support is Rp${PAYMENT_LIMIT.MAX_DONATION.toLocaleString("id-ID")}`

        );

    }

}