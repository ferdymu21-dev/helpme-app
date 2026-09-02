import "server-only";

import {
  PAYMENT_SESSION_DURATION_MINUTES,
} from "../constants/payment";

import type {
  MidtransExpiry,
} from "../types/midtrans";

const WIB_OFFSET_MILLISECONDS =
  7 * 60 * 60 * 1000;

function padTwoDigits(
  value: number,
) {
  return String(value).padStart(
    2,
    "0",
  );
}

function formatMidtransStartTime(
  date: Date,
) {
  /*
   * Midtrans mendokumentasikan format:
   *
   * YYYY-MM-DD HH:mm:ss +0700
   *
   * Server Vercel dapat berjalan dalam UTC,
   * jadi jangan bergantung pada timezone
   * lokal process Node.
   */
  const wibDate =
    new Date(
      date.getTime() +
        WIB_OFFSET_MILLISECONDS,
    );

  const year =
    wibDate.getUTCFullYear();

  const month =
    padTwoDigits(
      wibDate.getUTCMonth() + 1,
    );

  const day =
    padTwoDigits(
      wibDate.getUTCDate(),
    );

  const hours =
    padTwoDigits(
      wibDate.getUTCHours(),
    );

  const minutes =
    padTwoDigits(
      wibDate.getUTCMinutes(),
    );

  const seconds =
    padTwoDigits(
      wibDate.getUTCSeconds(),
    );

  return (
    `${year}-${month}-${day} ` +
    `${hours}:${minutes}:${seconds} ` +
    "+0700"
  );
}

export interface PaymentExpiry {
  paymentExpiresAt: string;

  midtransExpiry: MidtransExpiry;
}

export function createPaymentExpiry(
  currentTime: Date = new Date(),
): PaymentExpiry {
  /*
   * Midtrans start_time menggunakan
   * precision detik.
   *
   * Kita truncate milliseconds agar
   * deadline DB dan deadline Midtrans
   * berasal dari timestamp yang sama.
   */
  const startedAt =
    new Date(
      Math.floor(
        currentTime.getTime() /
          1000,
      ) * 1000,
    );

  const expiresAt =
    new Date(
      startedAt.getTime() +
        PAYMENT_SESSION_DURATION_MINUTES *
          60 *
          1000,
    );

  return {
    paymentExpiresAt:
      expiresAt.toISOString(),

    midtransExpiry: {
      start_time:
        formatMidtransStartTime(
          startedAt,
        ),

      duration:
        PAYMENT_SESSION_DURATION_MINUTES,

      unit: "minutes",
    },
  };
}