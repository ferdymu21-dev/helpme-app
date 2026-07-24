import {
    fetchPaymentStatus,
} from "@/lib/payments/server/paymentStatus.service";

export async function paymentStatusController(

    orderId: string,

) {

    return await fetchPaymentStatus(

        orderId,

    );

}