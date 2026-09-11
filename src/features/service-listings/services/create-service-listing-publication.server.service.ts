import "server-only";

import { ServiceListingConfig } from "../constants/service-listing-config";

import { validateAndNormalizeServiceListingId } from "../validators/validate-service-listing-identity";

import {
  claimFirstFreeServiceListingPublication,
  finalizeServiceListingPaymentCheckout,
  getServiceListingPublicationStatus,
  reserveServiceListingPublicationPayment,
} from "../repositories/service-listing-publication.server.repository";

import { PaymentType, generateOrderId } from "@/lib/payments/server/order";

import { createTransaction } from "@/lib/payments/server/createTransaction";

import { createPaymentExpiry } from "@/lib/payments/server/paymentExpiry";

import type {
  CreateServiceListingPublicationResult,
  ReservedServiceListingPublicationPayment,
} from "../types/service-listing-publication.types";

import { recoverServiceListingCreatingPayment } from "./recover-service-listing-creating-payment.server.service";

interface CreateServiceListingPublicationInput {
  listingId: unknown;

  providerId: string;
}

interface SnapTransactionResult {
  token: string;

  redirectUrl: string;
}

function parseSnapTransaction(value: unknown): SnapTransactionResult {
  if (typeof value !== "object" || value === null) {
    throw new Error("Response pembuatan transaksi Midtrans tidak valid.");
  }

  const token = Reflect.get(value, "token");

  const redirectUrl = Reflect.get(value, "redirect_url");

  if (
    typeof token !== "string" ||
    token.trim() === "" ||
    typeof redirectUrl !== "string" ||
    redirectUrl.trim() === ""
  ) {
    throw new Error("Response pembuatan transaksi Midtrans tidak lengkap.");
  }

  return {
    token: token.trim(),

    redirectUrl: redirectUrl.trim(),
  };
}

function buildPendingPaymentResult(
  listingId: string,
  payment: ReservedServiceListingPublicationPayment,
  amount: number,
): CreateServiceListingPublicationResult {
  if (
    payment.paymentStatus !== "PENDING" ||
    !payment.snapToken ||
    !payment.paymentUrl ||
    !payment.paymentExpiresAt
  ) {
    throw new Error("Sesi pembayaran Service listing tidak lengkap.");
  }

  return {
    kind: "PAYMENT_REQUIRED",

    created: false,

    listingId,

    paymentId: payment.paymentId,

    publicationAction: payment.publicationAction,

    paymentStatus: "PENDING",

    orderId: payment.orderId,

    amount,

    snapToken: payment.snapToken,

    redirectUrl: payment.paymentUrl,

    paymentExpiresAt: payment.paymentExpiresAt,
  };
}

export async function createServiceListingPublicationService(
  input: CreateServiceListingPublicationInput,
): Promise<CreateServiceListingPublicationResult> {
  const listingId = validateAndNormalizeServiceListingId(input.listingId);

  const providerId = input.providerId.trim();

  if (!providerId) {
    throw new Error("Unauthorized");
  }

  const currentStatus = await getServiceListingPublicationStatus(
    listingId,
    providerId,
  );

  /*
   * FIRST_LISTING_FREE only applies to DRAFT.
   *
   * Renewal states bypass this branch completely so the
   * M4C primitive is never called with an invalid lifecycle.
   */
  if (
    currentStatus === "DRAFT" &&
    ServiceListingConfig.firstListingFreeEnabled
  ) {
    const firstFree = await claimFirstFreeServiceListingPublication({
      listingId,

      providerId,

      firstFreeEnabled: ServiceListingConfig.firstListingFreeEnabled,

      maxReservedSlots: ServiceListingConfig.maxReservedSlots,
    });

    if (firstFree.activated) {
      if (
        !firstFree.publicationPeriodId ||
        !firstFree.startsAt ||
        !firstFree.endsAt
      ) {
        throw new Error(
          "First-free Service listing publication result tidak lengkap.",
        );
      }

      return {
        kind: "FIRST_FREE_ACTIVATED",

        listingId: firstFree.listingId,

        publicationPeriodId: firstFree.publicationPeriodId,

        startsAt: firstFree.startsAt,

        endsAt: firstFree.endsAt,
      };
    }
  }

  /*
   * Paid flow.
   *
   * The fee is obtained from trusted server configuration.
   * There is intentionally no browser-supplied amount.
   */
  const amount = ServiceListingConfig.publicationFeeAmount;

  let generatedOrderId = generateOrderId(PaymentType.SERVICE_LISTING);

  let reservation = await reserveServiceListingPublicationPayment({
    listingId,

    providerId,

    orderId: generatedOrderId,

    amount,

    publicationDurationSeconds: ServiceListingConfig.publicationDurationSeconds,

    maxReservedSlots: ServiceListingConfig.maxReservedSlots,
  });

  let shouldCreateMidtransCheckout = reservation.created;

  /*
   * An existing CREATING reservation may represent an
   * ambiguous Midtrans create attempt.
   *
   * Reconcile its existing Order ID before deciding
   * whether a replacement checkout may be created.
   */
  if (!reservation.created && reservation.paymentStatus === "CREATING") {
    const recovery = await recoverServiceListingCreatingPayment({
      providerId,

      orderId: reservation.orderId,
    });

    if (recovery.kind === "PAYMENT_APPLIED") {
      return {
        kind: "PAYMENT_APPLIED",

        created: false,

        listingId,

        paymentId: reservation.paymentId,

        publicationAction: reservation.publicationAction,

        paymentStatus: "PAID",

        orderId: reservation.orderId,

        amount,
      };
    }

    if (recovery.kind === "RETRY_SAME_ORDER") {
      shouldCreateMidtransCheckout = true;
    }

    if (recovery.kind === "RETRY_RESERVATION") {
      generatedOrderId = generateOrderId(PaymentType.SERVICE_LISTING);

      reservation = await reserveServiceListingPublicationPayment({
        listingId,

        providerId,

        orderId: generatedOrderId,

        amount,

        publicationDurationSeconds:
          ServiceListingConfig.publicationDurationSeconds,

        maxReservedSlots: ServiceListingConfig.maxReservedSlots,
      });

      shouldCreateMidtransCheckout = reservation.created;
    }
  }

  /*
   * Another request already owns this checkout.
   */
  if (!shouldCreateMidtransCheckout) {
    if (reservation.paymentStatus === "PENDING") {
      return buildPendingPaymentResult(listingId, reservation, amount);
    }

    return {
      kind: "PAYMENT_CREATING",

      created: false,

      listingId,

      paymentId: reservation.paymentId,

      publicationAction: reservation.publicationAction,

      paymentStatus: "CREATING",

      orderId: reservation.orderId,

      amount,
    };
  }

  /*
   * Create Snap only when:
   *
   * 1. this request owns a newly-created DB reservation, or
   * 2. authoritative status lookup returned 404 for an
   *    existing CREATING reservation and we are retrying
   *    the exact same Midtrans Order ID.
   *
   * Recovery never generates a second Order ID while the
   * previous CREATING payment remains nonterminal.
   */
  const { paymentExpiresAt, midtransExpiry } = createPaymentExpiry();

  let transaction: SnapTransactionResult;

  try {
    const rawTransaction: unknown = await createTransaction({
      orderId: reservation.orderId,

      amount,

      options: {
        expiry: midtransExpiry,
      },
    });

    transaction = parseSnapTransaction(rawTransaction);
  } catch (error) {
    /*
     * IMPORTANT:
     *
     * Do NOT automatically call
     * fail_service_listing_payment_creation().
     *
     * A network/provider error can be ambiguous: Midtrans
     * may have created the transaction even when this
     * application did not receive its response.
     *
     * F7.G reconciliation owns that recovery decision.
     */
    console.error(
      "[Service Listing Publication] Midtrans checkout creation failed:",
      error,
    );

    throw new Error(
      "Service listing payment provider is temporarily unavailable.",
    );
  }

  await finalizeServiceListingPaymentCheckout({
    paymentId: reservation.paymentId,

    providerId,

    snapToken: transaction.token,

    paymentUrl: transaction.redirectUrl,

    paymentExpiresAt,
  });

  return {
    kind: "PAYMENT_REQUIRED",

    created: true,

    listingId,

    paymentId: reservation.paymentId,

    publicationAction: reservation.publicationAction,

    paymentStatus: "PENDING",

    orderId: reservation.orderId,

    amount,

    snapToken: transaction.token,

    redirectUrl: transaction.redirectUrl,

    paymentExpiresAt,
  };
}
