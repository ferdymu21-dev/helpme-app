import {
  PAYMENT_STATUS,
} from "../constants/payment";

interface ResolvePaymentStatusOptions {
  afterDeadline?: boolean;
}

export function resolvePaymentStatus(
  status: string,

  fraudStatus?: string,

  options: ResolvePaymentStatusOptions = {},
) {
  const {
    afterDeadline = false,
  } = options;

  switch (status) {
    case "settlement":
      return PAYMENT_STATUS.PAID;

    case "capture":
      /*
       * Untuk card transaction,
       * fraud challenge belum boleh
       * dianggap sukses.
       */
      if (
        fraudStatus ===
        "challenge"
      ) {
        return PAYMENT_STATUS.PENDING;
      }

      if (
        fraudStatus ===
        "deny"
      ) {
        return PAYMENT_STATUS.FAILED;
      }

      /*
       * capture + accept adalah sukses.
       * Midtrans juga menyatakan capture
       * merupakan successful payment.
       */
      return PAYMENT_STATUS.PAID;

    case "pending":
      return PAYMENT_STATUS.PENDING;

    case "expire":
      return PAYMENT_STATUS.EXPIRED;

    case "cancel":
      return PAYMENT_STATUS.CANCELLED;

    case "failure":
      return PAYMENT_STATUS.FAILED;

    case "deny":
      /*
       * Midtrans official Node example
       * menyarankan deny tidak selalu
       * langsung difinalkan karena retry
       * dapat menghasilkan success.
       *
       * Setelah payment deadline berakhir,
       * retry sudah tidak lagi menjadi
       * bagian session HelpMe.
       */
      return afterDeadline
        ? PAYMENT_STATUS.FAILED
        : PAYMENT_STATUS.PENDING;

    default:
      return PAYMENT_STATUS.PENDING;
  }
}