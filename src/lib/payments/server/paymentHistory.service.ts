import {

    getPaymentHistory,

}

from "./paymentHistory.repository";

export async function fetchPaymentHistory(

    userId: string,

) {

    return await getPaymentHistory(

        userId,

    );

}