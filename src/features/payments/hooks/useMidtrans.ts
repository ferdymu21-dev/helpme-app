"use client";

import {
  useCallback,
  useRef,
} from "react";

interface OpenPaymentOptions {
  snapToken: string;

  onSuccess?: (
    result: unknown,
  ) => void;

  onPending?: (
    result: unknown,
  ) => void;

  onError?: (
    result: unknown,
  ) => void;

  onClose?: () => void;
}

type PaymentResolver = (
  result: unknown | null,
) => void;

export function useMidtrans() {
  const activeResolverRef =
    useRef<PaymentResolver | null>(
      null,
    );

  const settleActivePayment =
    useCallback(
      (
        result:
          | unknown
          | null,
      ) => {
        const resolver =
          activeResolverRef.current;

        activeResolverRef.current =
          null;

        resolver?.(result);
      },
      [],
    );

  const hidePayment =
    useCallback(() => {
      try {
        if (
          typeof window !==
            "undefined" &&
          window.snap?.hide
        ) {
          window.snap.hide();
        }
      } catch (error) {
        console.error(
          "Failed to hide Midtrans Snap",
          error,
        );
      } finally {
        /*
         * snap.hide() hanya mengatur UI Snap.
         *
         * Resolver diselesaikan juga agar
         * openPayment() tidak menggantung
         * apabila Midtrans tidak memanggil
         * onClose setelah hide().
         */
        settleActivePayment(
          null,
        );
      }
    }, [
      settleActivePayment,
    ]);

  const openPayment =
    useCallback(
      (
        options:
          OpenPaymentOptions,
      ) => {
        return new Promise<
          unknown | null
        >(
          (
            resolve,
            reject,
          ) => {
            /*
             * Jangan biarkan Promise lama
             * tetap menggantung bila secara
             * tidak sengaja ada sesi baru.
             */
            settleActivePayment(
              null,
            );

            activeResolverRef.current =
              resolve;

            try {
              if (
                typeof window ===
                  "undefined" ||
                !window.snap?.pay
              ) {
                activeResolverRef.current =
                  null;

                reject(
                  new Error(
                    "Midtrans Snap belum siap.",
                  ),
                );

                return;
              }

              window.snap.pay(
                options.snapToken,
                {
                  onSuccess(
                    result,
                  ) {
                    options.onSuccess?.(
                      result,
                    );

                    settleActivePayment(
                      result,
                    );
                  },

                  onPending(
                    result,
                  ) {
                    options.onPending?.(
                      result,
                    );

                    settleActivePayment(
                      result,
                    );
                  },

                  onError(
                    result,
                  ) {
                    console.error(
                      "MIDTRANS SNAP ERROR",
                      result,
                    );

                    options.onError?.(
                      result,
                    );

                    settleActivePayment(
                      result,
                    );
                  },

                  onClose() {
                    options.onClose?.();

                    settleActivePayment(
                      null,
                    );
                  },
                },
              );
            } catch (error) {
              activeResolverRef.current =
                null;

              reject(error);
            }
          },
        );
      },
      [
        settleActivePayment,
      ],
    );

  return {
    openPayment,
    hidePayment,
  };
}