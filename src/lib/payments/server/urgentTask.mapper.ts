import type {
    CreatePaymentResponse,
} from "@/features/payments/types/payment";

export function buildUrgentTaskResponse(

    orderId: string,

    transaction: {

        token: string;

        redirect_url: string;

    }

): CreatePaymentResponse {

    return {

        orderId,

        snapToken: transaction.token,

        redirectUrl: transaction.redirect_url,

    };

}