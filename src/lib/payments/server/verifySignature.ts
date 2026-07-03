import crypto from "crypto";

interface VerifySignaturePayload {

    orderId: string;

    statusCode: string;

    grossAmount: string;

    signatureKey: string;

}

export function verifySignature(

    payload: VerifySignaturePayload

) {

    const serverKey =

        process.env.MIDTRANS_SERVER_KEY!;

    const hash =

        crypto

            .createHash("sha512")

            .update(

                payload.orderId +

                payload.statusCode +

                payload.grossAmount +

                serverKey

            )

            .digest("hex");

    return hash === payload.signatureKey;

}