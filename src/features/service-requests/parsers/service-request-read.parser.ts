import { ServiceMode } from "@/features/service-listings/constants/service-mode";

import {
  SERVICE_REQUEST_STATUSES,
  type ServiceRequestStatusValue,
} from "../constants/service-request-status";

import type {
  ProviderServiceRequestSummary,
  ServiceRequestDetail,
} from "../types/service-request-read.types";

import type { ServiceRequestMode } from "../types/service-request.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Service Request field ${field} is invalid.`);
  }

  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Service Request field ${field} is invalid.`);
  }

  return value;
}

function requiredUuid(value: unknown, field: string): string {
  const parsed = requiredString(value, field);

  if (!UUID_PATTERN.test(parsed)) {
    throw new Error(`Service Request field ${field} is invalid.`);
  }

  return parsed;
}

function nullableUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return requiredUuid(value, field);
}

function parseSafeInteger(value: unknown, field: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Service Request field ${field} is invalid.`);
  }

  return parsed;
}

function nullablePositiveInteger(value: unknown, field: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = parseSafeInteger(value, field);

  if (parsed <= 0) {
    throw new Error(`Service Request field ${field} is invalid.`);
  }

  return parsed;
}

function parseStatus(value: unknown): ServiceRequestStatusValue {
  if (
    typeof value !== "string" ||
    !SERVICE_REQUEST_STATUSES.some((status) => status === value)
  ) {
    throw new Error("Service Request status is invalid.");
  }

  return value as ServiceRequestStatusValue;
}

function parseMode(value: unknown): ServiceRequestMode {
  if (value === ServiceMode.ONLINE || value === ServiceMode.OFFLINE) {
    return value;
  }

  throw new Error("Service Request mode is invalid.");
}

function parseBaseRequest(value: Record<string, unknown>) {
  return {
    id: requiredUuid(value.id, "id"),

    serviceListingId: requiredUuid(
      value.service_listing_id,
      "service_listing_id",
    ),

    customerId: requiredUuid(value.customer_id, "customer_id"),

    providerId: requiredUuid(value.provider_id, "provider_id"),

    requestDescription: requiredString(
      value.request_description,
      "request_description",
    ),

    neededAt: requiredString(value.needed_at, "needed_at"),

    serviceMode: parseMode(value.service_mode),

    locationName: nullableString(value.location_name, "location_name"),

    budget: nullablePositiveInteger(value.budget, "budget"),

    status: parseStatus(value.status),

    createdAt: requiredString(value.created_at, "created_at"),

    updatedAt: requiredString(value.updated_at, "updated_at"),

    listingTitle: requiredString(value.listing_title, "listing_title"),

    listingCategory: requiredString(value.listing_category, "listing_category"),

    listingCoverStoragePath: nullableString(
      value.listing_cover_storage_path,
      "listing_cover_storage_path",
    ),
  };
}

export function parseProviderServiceRequestSummary(
  value: unknown,
): ProviderServiceRequestSummary & {
  totalCount: number;
} {
  if (!isRecord(value)) {
    throw new Error("Provider Service Request row is invalid.");
  }

  return {
    ...parseBaseRequest(value),

    customerFullName: nullableString(
      value.customer_full_name,
      "customer_full_name",
    ),

    customerUsername: nullableString(
      value.customer_username,
      "customer_username",
    ),

    customerAvatarUrl: nullableString(
      value.customer_avatar_url,
      "customer_avatar_url",
    ),

    totalCount: parseSafeInteger(value.total_count, "total_count"),
  };
}

export function parseServiceRequestDetail(
  value: unknown,
): ServiceRequestDetail {
  if (!isRecord(value)) {
    throw new Error("Service Request detail is invalid.");
  }

  return {
    ...parseBaseRequest(value),

    agreedAt: nullableString(value.agreed_at, "agreed_at"),

    startedAt: nullableString(value.started_at, "started_at"),

    submittedAt: nullableString(value.submitted_at, "submitted_at"),

    completedAt: nullableString(value.completed_at, "completed_at"),

    declinedAt: nullableString(value.declined_at, "declined_at"),

    declinedReason: nullableString(value.declined_reason, "declined_reason"),

    cancelledAt: nullableString(value.cancelled_at, "cancelled_at"),

    cancelledBy: nullableUuid(value.cancelled_by, "cancelled_by"),

    cancellationReason: nullableString(
      value.cancellation_reason,
      "cancellation_reason",
    ),

    customerFullName: nullableString(
      value.customer_full_name,
      "customer_full_name",
    ),

    customerUsername: nullableString(
      value.customer_username,
      "customer_username",
    ),

    customerAvatarUrl: nullableString(
      value.customer_avatar_url,
      "customer_avatar_url",
    ),

    providerFullName: nullableString(
      value.provider_full_name,
      "provider_full_name",
    ),

    providerUsername: nullableString(
      value.provider_username,
      "provider_username",
    ),

    providerAvatarUrl: nullableString(
      value.provider_avatar_url,
      "provider_avatar_url",
    ),

    providerVerificationStatus: nullableString(
      value.provider_verification_status,
      "provider_verification_status",
    ),
  };
}
