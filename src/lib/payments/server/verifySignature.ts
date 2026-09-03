import "server-only";

import crypto from "crypto";

interface VerifySignaturePayload {
  orderId: string;

  statusCode: string;

  grossAmount: string;

  signatureKey: string;
}

export function verifySignature(
  payload: VerifySignaturePayload,
) {
  const serverKey =
    process.env.MIDTRANS_SERVER_KEY;

  if (
    !serverKey ||
    !payload.orderId ||
    !payload.statusCode ||
    !payload.grossAmount ||
    !payload.signatureKey
  ) {
    return false;
  }

  const expectedSignature =
    crypto
      .createHash("sha512")
      .update(
        payload.orderId +
          payload.statusCode +
          payload.grossAmount +
          serverKey,
      )
      .digest("hex");

  if (
    expectedSignature.length !==
    payload.signatureKey.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(
      expectedSignature,
      "utf8",
    ),

    Buffer.from(
      payload.signatureKey,
      "utf8",
    ),
  );
}