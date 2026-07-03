import {

    fetchPaymentHistory,

}

from "@/lib/payments/server/paymentHistory.service";

export async function paymentHistoryController(

    userId: string,

) {

    return await fetchPaymentHistory(

        userId,

    );

}