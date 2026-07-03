export const PAYMENT_LIMIT = {

    MIN_DONATION: 2000,

    MAX_DONATION: 5000000,

} as const;

export const PAYMENT_METHOD = {

    QRIS: "QRIS",

} as const;

export const PAYMENT_STATUS = {

    PENDING: "PENDING",

    PAID: "PAID",

    FAILED: "FAILED",

    EXPIRED: "EXPIRED",

    CANCELLED: "CANCELLED",

} as const;