import type {
    DonationResult,
} from "../types/donation";

export function buildDonationResponse(

    orderId: string,

    transaction: {

        token: string;

        redirect_url: string;

    }

): DonationResult {

    return {

        orderId,

        snapToken:

            transaction.token,

        redirectUrl:

            transaction.redirect_url,

    };

}