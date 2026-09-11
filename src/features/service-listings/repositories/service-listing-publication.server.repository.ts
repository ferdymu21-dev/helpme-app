import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type {
  FirstFreeServiceListingPublicationResult,
  ReservedServiceListingPublicationPayment,
  ServiceListingCheckoutPaymentStatus,
  ServiceListingPublicationAction,
} from "../types/service-listing-publication.types";

import type { PaymentStatusValue } from "@/lib/payments/constants/payment";

interface ApplyServiceListingPaymentStatusInput {
  orderId: string;

  paymentStatus: PaymentStatusValue;

  transactionId?: string;

  paymentMethod?: string;

  paidAt?: string;

  expiredAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireRow(value: unknown, message: string): Record<string, unknown> {
  if (Array.isArray(value) && value.length === 1 && isRecord(value[0])) {
    return value[0];
  }

  if (isRecord(value)) {
    return value;
  }

  throw new Error(message);
}

function requireBoolean(value: unknown, message: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(message);
  }

  return value;
}

function requireNonBlankString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }

  return value.trim();
}

function optionalNonBlankString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function requirePublicationAction(
  value: unknown,
): ServiceListingPublicationAction {
  if (
    value === "INITIAL_PUBLICATION" ||
    value === "EXPIRED_RENEWAL" ||
    value === "EARLY_RENEWAL"
  ) {
    return value;
  }

  throw new Error("Service listing publication action tidak valid.");
}

function requireCheckoutPaymentStatus(
  value: unknown,
): ServiceListingCheckoutPaymentStatus {
  if (value === "CREATING" || value === "PENDING") {
    return value;
  }

  throw new Error("Service listing checkout status tidak valid.");
}

function throwDatabaseError(error: { message?: string }): never {
  throw new Error(
    error.message || "Service listing publication database operation failed.",
  );
}

export async function getServiceListingPublicationStatus(
  listingId: string,
  providerId: string,
): Promise<string> {
  const { data, error } = await adminSupabase
    .from("service_listings")
    .select("status")
    .eq("id", listingId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (error) {
    throwDatabaseError(error);
  }

  const rawData: unknown = data;

  if (!isRecord(rawData) || typeof rawData.status !== "string") {
    throw new Error("Service listing was not found.");
  }

  return rawData.status;
}

interface ClaimFirstFreeInput {
  listingId: string;

  providerId: string;

  firstFreeEnabled: boolean;

  maxReservedSlots: number;
}

export async function claimFirstFreeServiceListingPublication(
  input: ClaimFirstFreeInput,
): Promise<FirstFreeServiceListingPublicationResult> {
  const { data, error } = await adminSupabase.rpc(
    "claim_first_free_service_listing_publication",
    {
      p_listing_id: input.listingId,

      p_provider_id: input.providerId,

      p_first_free_enabled: input.firstFreeEnabled,

      p_max_reserved_slots: input.maxReservedSlots,
    },
  );

  if (error) {
    throwDatabaseError(error);
  }

  const row = requireRow(
    data,
    "Response first-free Service listing tidak valid.",
  );

  const activated = requireBoolean(
    row.activated,
    "Status first-free Service listing tidak valid.",
  );

  const listingId = requireNonBlankString(
    row.listing_id,
    "Service listing ID hasil first-free tidak valid.",
  );

  return {
    activated,

    listingId,

    publicationPeriodId: optionalNonBlankString(row.publication_period_id),

    startsAt: optionalNonBlankString(row.starts_at),

    endsAt: optionalNonBlankString(row.ends_at),
  };
}

interface ReservePublicationPaymentInput {
  listingId: string;

  providerId: string;

  orderId: string;

  amount: number;

  publicationDurationSeconds: number;

  maxReservedSlots: number;
}

export async function reserveServiceListingPublicationPayment(
  input: ReservePublicationPaymentInput,
): Promise<ReservedServiceListingPublicationPayment> {
  const { data, error } = await adminSupabase.rpc(
    "reserve_service_listing_publication_payment",
    {
      p_listing_id: input.listingId,

      p_provider_id: input.providerId,

      p_order_id: input.orderId,

      p_amount: input.amount,

      p_publication_duration_seconds: input.publicationDurationSeconds,

      p_max_reserved_slots: input.maxReservedSlots,
    },
  );

  if (error) {
    throwDatabaseError(error);
  }

  const row = requireRow(
    data,
    "Response reservation Service listing payment tidak valid.",
  );

  return {
    created: requireBoolean(
      row.created,
      "Status reservation Service listing payment tidak valid.",
    ),

    paymentId: requireNonBlankString(
      row.payment_id,
      "Service listing payment ID tidak valid.",
    ),

    paymentStatus: requireCheckoutPaymentStatus(row.payment_status),

    publicationAction: requirePublicationAction(row.publication_action),

    orderId: requireNonBlankString(
      row.midtrans_order_id,
      "Midtrans order ID Service listing tidak valid.",
    ),

    snapToken: optionalNonBlankString(row.snap_token),

    paymentUrl: optionalNonBlankString(row.payment_url),

    paymentExpiresAt: optionalNonBlankString(row.payment_expires_at),

    renewalBaseExpiresAt: optionalNonBlankString(row.renewal_base_expires_at),
  };
}

interface FinalizePublicationCheckoutInput {
  paymentId: string;

  providerId: string;

  snapToken: string;

  paymentUrl: string;

  paymentExpiresAt: string;
}

export async function finalizeServiceListingPaymentCheckout(
  input: FinalizePublicationCheckoutInput,
): Promise<boolean> {
  const { data, error } = await adminSupabase.rpc(
    "finalize_service_listing_payment_checkout",
    {
      p_payment_id: input.paymentId,

      p_provider_id: input.providerId,

      p_snap_token: input.snapToken,

      p_payment_url: input.paymentUrl,

      p_payment_expires_at: input.paymentExpiresAt,
    },
  );

  if (error) {
    throwDatabaseError(error);
  }

  if (typeof data !== "boolean") {
    throw new Error("Response finalisasi Service listing payment tidak valid.");
  }

  return data;
}

export async function applyServiceListingPaymentStatus(
  input: ApplyServiceListingPaymentStatusInput,
): Promise<void> {
  const { data, error } = await adminSupabase.rpc(
    "apply_service_listing_payment_status",
    {
      p_order_id: input.orderId,

      p_payment_status: input.paymentStatus,

      p_transaction_id: input.transactionId ?? null,

      p_payment_method: input.paymentMethod ?? null,

      p_paid_at: input.paidAt ?? null,

      p_expired_at: input.expiredAt ?? null,
    },
  );

  if (error) {
    throwDatabaseError(error);
  }

  if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) {
    throw new Error(
      "Response penerapan status pembayaran Service listing tidak valid.",
    );
  }
}
