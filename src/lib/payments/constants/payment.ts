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

export type PaymentStatusValue =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/*
 * Deadline maksimum satu sesi pembayaran.
 *
 * Nilai yang sama digunakan untuk:
 * 1. blanket expiry Midtrans
 * 2. payment_expires_at di database
 *
 * Jangan gunakan angka durasi payment
 * secara terpisah di file lain.
 */
export const PAYMENT_SESSION_DURATION_MINUTES =
  15;