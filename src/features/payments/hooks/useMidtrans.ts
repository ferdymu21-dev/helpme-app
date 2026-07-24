"use client";

import { useCallback } from "react";

interface OpenPaymentOptions {

    snapToken: string;

    onSuccess?: (result: unknown) => void;

    onPending?: (result: unknown) => void;

    onError?: (result: unknown) => void;

    onClose?: () => void;

}

declare global {

    interface Window {

        snap: {

            pay: (

                token: string,

                options?: {

                    onSuccess?: (

                        result: unknown

                    ) => void;

                    onPending?: (

                        result: unknown

                    ) => void;

                    onError?: (

                        result: unknown

                    ) => void;

                    onClose?: () => void;

                }

            ) => void;

        };

    }

}

export function useMidtrans() {

    const openPayment = useCallback(

        (

            options: OpenPaymentOptions

        ) => {

            return new Promise((

                resolve

            ) => {

                console.log(

                    "OPEN MIDTRANS",

                    options.snapToken

                );

                window.snap.pay(

                    options.snapToken,

                    {

                        onSuccess(result) {

                            console.log(

                                "SUCCESS",

                                result

                            );

                            options.onSuccess?.(result);

                            resolve(result);

                        },

                        onPending(result) {

                            console.log(

                                "PENDING",

                                result

                            );

                            options.onPending?.(result);

                            resolve(

                                result

                            );

                        },

                        onError(result) {

                            console.error(

                                "ERROR",

                                result

                            );

                            options.onError?.(

                                result

                            );

                            resolve(result);

                        },

                        onClose() {

                            console.log(

                                "CLOSED"

                            );

                            options.onClose?.();

                            resolve(null);

                        },

                    }

                );

            });

        },

        []

    );

    return {

        openPayment,

    };

}