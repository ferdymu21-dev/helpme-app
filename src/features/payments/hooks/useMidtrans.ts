"use client";

import { useCallback } from "react";

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

            snapToken: string

        ) => {

            return new Promise((

                resolve,

                reject

            ) => {

                console.log(

                    "OPEN MIDTRANS",

                    snapToken

                );

                window.snap.pay(

                    snapToken,

                    {

                        onSuccess(result) {

                            console.log(

                                "SUCCESS",

                                result

                            );

                            resolve(result);

                        },

                        onPending(

                            result

                        ) {
                            console.log(

                                "PENDING",

                                result

                            );

                            resolve(

                                result

                            );

                        },

                        onError(

                            result

                        ) {

                            console.error(

                                "ERROR",

                                result

                            );

                            reject(

                                result

                            );

                        },

                        onClose() {

                            console.log(

                                "CLOSED"

                            );

                            reject(

                                new Error(

                                    "Payment popup closed."

                                )

                            );

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