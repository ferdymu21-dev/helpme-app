import "server-only";

import { getMidtransHttpStatusCode } from "@/lib/payments/server/midtransStatus.parser";

import { getPaymentStatus } from "@/lib/payments/server/paymentStatus.repository";

import { reconcilePendingPayment } from "@/lib/payments/server/paymentReconciliation.service";

interface RecoverServiceListingCreatingPaymentInput {
  providerId: string;

  orderId: string;
}

export type RecoverServiceListingCreatingPaymentResult =
  | {
      kind: "STILL_CREATING";
    }
  | {
      kind: "RETRY_SAME_ORDER";
    }
  | {
      kind: "RETRY_RESERVATION";
    }
  | {
      kind: "PAYMENT_APPLIED";
    };

function assertServiceListingSnapshot(paymentType: string) {
  if (paymentType !== "SERVICE_LISTING") {
    throw new Error("Payment recovery tidak mengarah ke Service listing.");
  }
}

export async function recoverServiceListingCreatingPayment(
  input: RecoverServiceListingCreatingPaymentInput,
): Promise<RecoverServiceListingCreatingPaymentResult> {
  const snapshot = await getPaymentStatus(input.providerId, input.orderId);

  assertServiceListingSnapshot(snapshot.paymentType);

  /*
   * A concurrent request may already have moved the
   * local payment while this request was waiting.
   */
  if (snapshot.status === "PAID") {
    return {
      kind: "PAYMENT_APPLIED",
    };
  }

  /*
   * PENDING means another request successfully finalized
   * this checkout. Re-run reservation afterwards so the
   * canonical stored Snap session can be returned.
   *
   * Terminal non-PAID states have released the previous
   * reservation and may create a replacement payment.
   */
  if (
    snapshot.status === "PENDING" ||
    snapshot.status === "FAILED" ||
    snapshot.status === "CANCELLED" ||
    snapshot.status === "EXPIRED"
  ) {
    return {
      kind: "RETRY_RESERVATION",
    };
  }

  if (snapshot.status !== "CREATING") {
    throw new Error("Status Service listing payment tidak dapat direcover.");
  }

  try {
    const reconciled = await reconcilePendingPayment(snapshot, input.orderId);

    /*
     * Midtrans knows this exact Order ID but the transaction
     * is still PENDING/challenge.
     *
     * Do not create another Order ID. The original Snap
     * token cannot be reconstructed from the status flow.
     */
    if (!reconciled) {
      return {
        kind: "STILL_CREATING",
      };
    }
  } catch (error) {
    if (getMidtransHttpStatusCode(error) !== 404) {
      throw error;
    }

    /*
     * Midtrans does not currently know this Order ID.
     *
     * Do NOT release the CREATING reservation here:
     * another create request for this same Order ID could
     * still be in flight.
     *
     * Retrying Create Snap with the SAME Order ID preserves
     * the Midtrans uniqueness boundary and cannot introduce
     * a second HelpMe publication payment identity.
     */
    return {
      kind: "RETRY_SAME_ORDER",
    };
  }

  /*
   * reconcilePendingPayment() returned true, so an
   * authoritative terminal status was applied through M9.
   */
  const refreshed = await getPaymentStatus(input.providerId, input.orderId);

  assertServiceListingSnapshot(refreshed.paymentType);

  if (refreshed.status === "PAID") {
    return {
      kind: "PAYMENT_APPLIED",
    };
  }

  if (
    refreshed.status === "FAILED" ||
    refreshed.status === "CANCELLED" ||
    refreshed.status === "EXPIRED" ||
    refreshed.status === "PENDING"
  ) {
    return {
      kind: "RETRY_RESERVATION",
    };
  }

  throw new Error(
    "Recovery Service listing payment tidak menghasilkan status final.",
  );
}
