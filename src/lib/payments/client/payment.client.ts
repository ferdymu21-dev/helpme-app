import type {

    DonationPaymentResponse,

} from "../types/payment";

export async function createDonationPayment(

    amount: number

): Promise<DonationPaymentResponse> {

    const response =

        await fetch(

            "/api/payments/donate",

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json",

                },

                body:

                    JSON.stringify({

                        amount,

                    }),

            }

        );

    if (!response.ok) {

        throw new Error(

            "Failed to create payment"

        );

    }

    return response.json();

}