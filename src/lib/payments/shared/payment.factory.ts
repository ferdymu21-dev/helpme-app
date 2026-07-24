import type {

    PaymentDetailBase,

    PaymentHistoryBase,

    PaymentStatus,

    PaymentType,

} from "./payment.types";

interface BaseFactoryInput {

    id: string;

    type: PaymentType;

    title: string;

    amount: number;

    status: PaymentStatus;

    orderId: string;

    paymentMethod: string | null;

    createdAt: string;

    taskId?: string | null;

}

export function createPaymentHistory(

    payment: BaseFactoryInput,

): PaymentHistoryBase {

    return {

        ...payment,

    };

}

export function createPaymentDetail(

    payment: BaseFactoryInput,

): PaymentDetailBase {

    return {

        ...payment,

    };

}