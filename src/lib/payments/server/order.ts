import "server-only";

export enum PaymentType {

    DONATION = "DONATION",

    URGENT_TASK = "URGENT_TASK",

    SERVICE_LISTING = "SERVICE_LISTING",

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

    const orderPrefix =
        type === PaymentType.DONATION
            ? "SUPPORT"
            : type;

    return `HELPME-${orderPrefix}-${now}-${random}`;

}