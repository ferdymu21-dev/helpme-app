"use server";

import {

    loadPendingPayments,

}

from "@/lib/payments/server/paymentLoader.service";

export async function loadPayments(

    transactionType: string

) {

    return await loadPendingPayments(

        transactionType

    );

}