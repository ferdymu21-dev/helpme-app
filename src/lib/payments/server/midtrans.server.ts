import "server-only";

import midtransClient
from "midtrans-client";

import type {
    MidtransTransaction,
} from "../types/midtrans";

export const snap =

new midtransClient.Snap({

    isProduction:

        process.env
            .MIDTRANS_IS_PRODUCTION === "true",

    serverKey:

        process.env
            .MIDTRANS_SERVER_KEY!,

    clientKey:

        process.env
            .NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,

});

export async function createSnapTransaction(

    params: MidtransTransaction

)

{

    return await snap.createTransaction(

        params

    );

}