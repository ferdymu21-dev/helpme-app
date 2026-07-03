import {
    PAYMENT_STATUS,
} from "../constants/payment";

export function resolvePaymentStatus(

    status: string

) {

    switch (

        status

    ) {

        case "settlement":

        case "capture":

            return PAYMENT_STATUS.PAID;

        case "pending":

            return PAYMENT_STATUS.PENDING;

        case "expire":

            return PAYMENT_STATUS.EXPIRED;

        case "cancel":

            return PAYMENT_STATUS.CANCELLED;

        case "deny":

        case "failure":

            return PAYMENT_STATUS.FAILED;

        default:

            return PAYMENT_STATUS.PENDING;

    }

}