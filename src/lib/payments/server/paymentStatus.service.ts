import {
    getPaymentStatus,
} from "./paymentStatus.repository";

export async function fetchPaymentStatus(

    orderId: string,

) {

    return await getPaymentStatus(
        orderId,
    );

}