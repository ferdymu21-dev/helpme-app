import {

    getPaymentStatus,

}

from "./paymentStatus.repository";

export async function fetchPaymentStatus(

    orderId: string,

) {

    return {

        status:

            await getPaymentStatus(

                orderId,

            ),

    };

}