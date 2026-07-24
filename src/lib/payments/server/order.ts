import "server-only";

export enum PaymentType {

    DONATION = "DONATION",

    URGENT_TASK = "URGENT_TASK",

    FEATURED_TASK = "FEATURED_TASK",

    SUBSCRIPTION = "SUBSCRIPTION",

    ESCROW = "ESCROW",

}

export function generateOrderId(

    type: PaymentType

) {

    const now = Date.now();

    const random =

        Math.floor(

            Math.random() * 100000

        );

    return `HELPME-${type}-${now}-${random}`;

}