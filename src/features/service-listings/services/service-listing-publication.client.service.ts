import type {
  CreateServiceListingPublicationResult,
  ServiceListingPublicationAction,
} from "../types/service-listing-publication.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isPublicationAction(
  value: unknown,
): value is ServiceListingPublicationAction {
  return (
    value === "INITIAL_PUBLICATION" ||
    value === "EXPIRED_RENEWAL" ||
    value === "EARLY_RENEWAL"
  );
}

function isPositiveAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isPublicationResult(
  value: unknown,
): value is CreateServiceListingPublicationResult {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.listingId) ||
    typeof value.kind !== "string"
  ) {
    return false;
  }

  switch (value.kind) {
    case "FIRST_FREE_ACTIVATED":
      return (
        isNonEmptyString(value.publicationPeriodId) &&
        isNonEmptyString(value.startsAt) &&
        isNonEmptyString(value.endsAt)
      );

    case "PAYMENT_REQUIRED":
      return (
        typeof value.created === "boolean" &&
        isNonEmptyString(value.paymentId) &&
        isPublicationAction(value.publicationAction) &&
        value.paymentStatus === "PENDING" &&
        isNonEmptyString(value.orderId) &&
        isPositiveAmount(value.amount) &&
        isNonEmptyString(value.snapToken) &&
        isNonEmptyString(value.redirectUrl) &&
        isNonEmptyString(value.paymentExpiresAt)
      );

    case "PAYMENT_CREATING":
      return (
        value.created === false &&
        isNonEmptyString(value.paymentId) &&
        isPublicationAction(value.publicationAction) &&
        value.paymentStatus === "CREATING" &&
        isNonEmptyString(value.orderId) &&
        isPositiveAmount(value.amount)
      );

    case "PAYMENT_APPLIED":
      return (
        value.created === false &&
        isNonEmptyString(value.paymentId) &&
        isPublicationAction(value.publicationAction) &&
        value.paymentStatus === "PAID" &&
        isNonEmptyString(value.orderId) &&
        isPositiveAmount(value.amount)
      );

    default:
      return false;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();

    if (
      isRecord(payload) &&
      typeof payload.message === "string" &&
      payload.message.trim() !== ""
    ) {
      return payload.message;
    }
  } catch {
    // Gunakan fallback di bawah.
  }

  return "Gagal memproses publikasi jasa.";
}

export async function requestServiceListingPublicationClient(
  listingId: string,
): Promise<CreateServiceListingPublicationResult> {
  const normalizedListingId = listingId.trim();

  if (!normalizedListingId) {
    throw new Error("ID jasa tidak valid.");
  }

  const response = await fetch(
    `/api/service-listings/${encodeURIComponent(
      normalizedListingId,
    )}/publication`,
    {
      method: "POST",

      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isPublicationResult(payload)) {
    throw new Error("Response publikasi jasa tidak valid.");
  }

  if (payload.listingId.toLowerCase() !== normalizedListingId.toLowerCase()) {
    throw new Error("Response publikasi jasa tidak sesuai.");
  }

  return payload;
}