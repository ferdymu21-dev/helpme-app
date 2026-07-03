import {

    getPendingDonations,

}

from "./paymentLoader.repository";

export async function loadPendingPayments(

    transactionType: string

) {

    switch (

        transactionType

    ) {

        case "DONATION":

            return await getPendingDonations();

        default:

            return [];

    }

}