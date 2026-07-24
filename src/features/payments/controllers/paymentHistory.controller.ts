import {
    getTransactionHistory,
} from "@/lib/payments/server/history.service";

export async function paymentHistoryController(

    userId: string,

    cursor?: string,

    limit: number = 10,

) {

    return await getTransactionHistory(

        userId,

        cursor,

        limit,

    );

}