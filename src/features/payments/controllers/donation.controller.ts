import {
    createDonation,
} from "@/lib/payments/server/donation.server";

import type {
    CreateDonationCommand,
} from "@/lib/payments/types/donation";

export async function

createDonationController(

    payload: CreateDonationCommand

) {

    return await createDonation(

        payload

    );

}