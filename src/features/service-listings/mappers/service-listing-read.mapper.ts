import type {
  ServiceListingStatusValue,
} from "../constants/service-listing-status";

import type {
  ServiceModeValue,
} from "../constants/service-mode";

import type {
  MyServiceListingDetailRpcRow,
  MyServiceListingRpcRow,
  ProviderServiceListing,
  PublicServiceListingCard,
  PublicServiceListingDetail,
  PublicServiceListingDetailRpcRow,
  PublicServiceListingRpcRow,
  ServiceListingBlockedFromStatus,
} from "../types/service-listing-read.types";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireRecord(
  value: unknown,
  context: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(
      `${context} is not a valid object.`,
    );
  }

  return value;
}

function readString(
  record: Record<string, unknown>,
  field: string,
): string {
  const value = record[field];

  if (typeof value !== "string") {
    throw new Error(
      `Invalid Service Listing RPC field: ${field}.`,
    );
  }

  return value;
}

function readNullableString(
  record: Record<string, unknown>,
  field: string,
): string | null {
  const value = record[field];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(
      `Invalid Service Listing RPC field: ${field}.`,
    );
  }

  return value;
}

function readBoolean(
  record: Record<string, unknown>,
  field: string,
): boolean {
  const value = record[field];

  if (typeof value !== "boolean") {
    throw new Error(
      `Invalid Service Listing RPC field: ${field}.`,
    );
  }

  return value;
}

function parseSafeIntegerValue(
  value: unknown,
  field: string,
): number {
  if (
    typeof value === "number" &&
    Number.isSafeInteger(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    /^-?\d+$/.test(value)
  ) {
    const parsed =
      Number(value);

    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  }

  throw new Error(
    `Invalid Service Listing integer field: ${field}.`,
  );
}

function readSafeInteger(
  record: Record<string, unknown>,
  field: string,
): number {
  return parseSafeIntegerValue(
    record[field],
    field,
  );
}

function readNullableSafeInteger(
  record: Record<string, unknown>,
  field: string,
): number | null {
  const value = record[field];

  if (value === null) {
    return null;
  }

  return parseSafeIntegerValue(
    value,
    field,
  );
}

function parseFiniteNumberValue(
  value: unknown,
  field: string,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed =
      Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(
    `Invalid Service Listing numeric field: ${field}.`,
  );
}

function readNullableFiniteNumber(
  record: Record<string, unknown>,
  field: string,
): number | null {
  const value = record[field];

  if (value === null) {
    return null;
  }

  return parseFiniteNumberValue(
    value,
    field,
  );
}

function readServiceMode(
  record: Record<string, unknown>,
  field: string,
): ServiceModeValue {
  const value = record[field];

  switch (value) {
    case "ONLINE":
    case "OFFLINE":
    case "BOTH":
      return value;

    default:
      throw new Error(
        `Invalid Service Listing mode field: ${field}.`,
      );
  }
}

function readServiceListingStatus(
  record: Record<string, unknown>,
  field: string,
): ServiceListingStatusValue {
  const value = record[field];

  switch (value) {
    case "DRAFT":
    case "PAYMENT_PENDING":
    case "ACTIVE":
    case "PAUSED":
    case "EXPIRED":
    case "BLOCKED":
    case "ARCHIVED":
      return value;

    default:
      throw new Error(
        `Invalid Service Listing status field: ${field}.`,
      );
  }
}

function readBlockedFromStatus(
  record: Record<string, unknown>,
  field: string,
): ServiceListingBlockedFromStatus | null {
  const value = record[field];

  if (value === null) {
    return null;
  }

  switch (value) {
    case "ACTIVE":
      return "ACTIVE";

    case "PAUSED":
      return "PAUSED";

    case "EXPIRED":
      return "EXPIRED";

    default:
      throw new Error(
        `Invalid Service Listing blocked-from field: ${field}.`,
      );
  }
}

function parseMyServiceListingDetailRecord(
  row: Record<string, unknown>,
): MyServiceListingDetailRpcRow {
  return {
    id:
      readString(
        row,
        "id",
      ),

    title:
      readString(
        row,
        "title",
      ),

    category:
      readString(
        row,
        "category",
      ),

    description:
      readString(
        row,
        "description",
      ),

    deliverables:
      readString(
        row,
        "deliverables",
      ),

    customer_preparation:
      readNullableString(
        row,
        "customer_preparation",
      ),

    price_from:
      readSafeInteger(
        row,
        "price_from",
      ),

    is_negotiable:
      readBoolean(
        row,
        "is_negotiable",
      ),

    service_mode:
      readServiceMode(
        row,
        "service_mode",
      ),

    location_name:
      readNullableString(
        row,
        "location_name",
      ),

    status:
      readServiceListingStatus(
        row,
        "status",
      ),

    published_at:
      readNullableString(
        row,
        "published_at",
      ),

    activated_at:
      readNullableString(
        row,
        "activated_at",
      ),

    expires_at:
      readNullableString(
        row,
        "expires_at",
      ),

    paused_at:
      readNullableString(
        row,
        "paused_at",
      ),

    blocked_at:
      readNullableString(
        row,
        "blocked_at",
      ),

    blocked_reason:
      readNullableString(
        row,
        "blocked_reason",
      ),

    blocked_from_status:
      readBlockedFromStatus(
        row,
        "blocked_from_status",
      ),

    archived_at:
      readNullableString(
        row,
        "archived_at",
      ),

    created_at:
      readString(
        row,
        "created_at",
      ),

    updated_at:
      readString(
        row,
        "updated_at",
      ),

    cover_storage_path:
      readNullableString(
        row,
        "cover_storage_path",
      ),
  };
}

export function parseMyServiceListingDetailRpcRow(
  value: unknown,
): MyServiceListingDetailRpcRow {
  const row =
    requireRecord(
      value,
      "get_my_service_listing_detail row",
    );

  return parseMyServiceListingDetailRecord(
    row,
  );
}

export function parseMyServiceListingRpcRow(
  value: unknown,
): MyServiceListingRpcRow {
  const row =
    requireRecord(
      value,
      "get_my_service_listings row",
    );

  return {
    ...parseMyServiceListingDetailRecord(
      row,
    ),

    total_count:
      readSafeInteger(
        row,
        "total_count",
      ),
  };
}

export function parsePublicServiceListingRpcRow(
  value: unknown,
): PublicServiceListingRpcRow {
  const row =
    requireRecord(
      value,
      "get_public_service_listings row",
    );

  return {
    id:
      readString(
        row,
        "id",
      ),

    provider_id:
      readString(
        row,
        "provider_id",
      ),

    title:
      readString(
        row,
        "title",
      ),

    category:
      readString(
        row,
        "category",
      ),

    description:
      readString(
        row,
        "description",
      ),

    price_from:
      readSafeInteger(
        row,
        "price_from",
      ),

    is_negotiable:
      readBoolean(
        row,
        "is_negotiable",
      ),

    service_mode:
      readServiceMode(
        row,
        "service_mode",
      ),

    location_name:
      readNullableString(
        row,
        "location_name",
      ),

    created_at:
      readString(
        row,
        "created_at",
      ),

    expires_at:
      readString(
        row,
        "expires_at",
      ),

    cover_storage_path:
      readNullableString(
        row,
        "cover_storage_path",
      ),

    provider_full_name:
      readNullableString(
        row,
        "provider_full_name",
      ),

    provider_username:
      readNullableString(
        row,
        "provider_username",
      ),

    provider_avatar_url:
      readNullableString(
        row,
        "provider_avatar_url",
      ),

    provider_rating:
      readNullableFiniteNumber(
        row,
        "provider_rating",
      ),

    provider_total_reviews:
      readNullableSafeInteger(
        row,
        "provider_total_reviews",
      ),

    provider_verification_status:
      readNullableString(
        row,
        "provider_verification_status",
      ),

    total_count:
      readSafeInteger(
        row,
        "total_count",
      ),
  };
}

export function parsePublicServiceListingDetailRpcRow(
  value: unknown,
): PublicServiceListingDetailRpcRow {
  const row =
    requireRecord(
      value,
      "get_public_service_listing_detail row",
    );

  return {
    id:
      readString(
        row,
        "id",
      ),

    provider_id:
      readString(
        row,
        "provider_id",
      ),

    title:
      readString(
        row,
        "title",
      ),

    category:
      readString(
        row,
        "category",
      ),

    description:
      readString(
        row,
        "description",
      ),

    deliverables:
      readString(
        row,
        "deliverables",
      ),

    customer_preparation:
      readNullableString(
        row,
        "customer_preparation",
      ),

    price_from:
      readSafeInteger(
        row,
        "price_from",
      ),

    is_negotiable:
      readBoolean(
        row,
        "is_negotiable",
      ),

    service_mode:
      readServiceMode(
        row,
        "service_mode",
      ),

    location_name:
      readNullableString(
        row,
        "location_name",
      ),

    published_at:
      readString(
        row,
        "published_at",
      ),

    created_at:
      readString(
        row,
        "created_at",
      ),

    expires_at:
      readString(
        row,
        "expires_at",
      ),

    cover_storage_path:
      readNullableString(
        row,
        "cover_storage_path",
      ),

    provider_full_name:
      readNullableString(
        row,
        "provider_full_name",
      ),

    provider_username:
      readNullableString(
        row,
        "provider_username",
      ),

    provider_avatar_url:
      readNullableString(
        row,
        "provider_avatar_url",
      ),

    provider_rating:
      readNullableFiniteNumber(
        row,
        "provider_rating",
      ),

    provider_total_reviews:
      readNullableSafeInteger(
        row,
        "provider_total_reviews",
      ),

    provider_verification_status:
      readNullableString(
        row,
        "provider_verification_status",
      ),
  };
}

export function parseMyServiceListingRpcRows(
  value: unknown,
): MyServiceListingRpcRow[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "get_my_service_listings returned an invalid result.",
    );
  }

  return value.map(
    parseMyServiceListingRpcRow,
  );
}

export function parsePublicServiceListingRpcRows(
  value: unknown,
): PublicServiceListingRpcRow[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "get_public_service_listings returned an invalid result.",
    );
  }

  return value.map(
    parsePublicServiceListingRpcRow,
  );
}

export function mapMyServiceListingDetailRpcRow(
  row: MyServiceListingDetailRpcRow,
): ProviderServiceListing {
  return {
    id:
      row.id,

    title:
      row.title,

    category:
      row.category,

    description:
      row.description,

    deliverables:
      row.deliverables,

    customerPreparation:
      row.customer_preparation,

    priceFrom:
      row.price_from,

    isNegotiable:
      row.is_negotiable,

    serviceMode:
      row.service_mode,

    locationName:
      row.location_name,

    status:
      row.status,

    publishedAt:
      row.published_at,

    activatedAt:
      row.activated_at,

    expiresAt:
      row.expires_at,

    pausedAt:
      row.paused_at,

    blockedAt:
      row.blocked_at,

    blockedReason:
      row.blocked_reason,

    blockedFromStatus:
      row.blocked_from_status,

    archivedAt:
      row.archived_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    coverStoragePath:
      row.cover_storage_path,
  };
}

export function mapMyServiceListingRpcRow(
  row: MyServiceListingRpcRow,
): ProviderServiceListing {
  return mapMyServiceListingDetailRpcRow(
    row,
  );
}

export function mapPublicServiceListingRpcRow(
  row: PublicServiceListingRpcRow,
): PublicServiceListingCard {
  return {
    id:
      row.id,

    title:
      row.title,

    category:
      row.category,

    description:
      row.description,

    priceFrom:
      row.price_from,

    isNegotiable:
      row.is_negotiable,

    serviceMode:
      row.service_mode,

    locationName:
      row.location_name,

    createdAt:
      row.created_at,

    expiresAt:
      row.expires_at,

    coverStoragePath:
      row.cover_storage_path,

    provider: {
      id:
        row.provider_id,

      fullName:
        row.provider_full_name,

      username:
        row.provider_username,

      avatarUrl:
        row.provider_avatar_url,

      rating:
        row.provider_rating,

      totalReviews:
        row.provider_total_reviews,

      verificationStatus:
        row.provider_verification_status,
    },
  };
}

export function mapPublicServiceListingDetailRpcRow(
  row: PublicServiceListingDetailRpcRow,
): PublicServiceListingDetail {
  return {
    id:
      row.id,

    title:
      row.title,

    category:
      row.category,

    description:
      row.description,

    deliverables:
      row.deliverables,

    customerPreparation:
      row.customer_preparation,

    priceFrom:
      row.price_from,

    isNegotiable:
      row.is_negotiable,

    serviceMode:
      row.service_mode,

    locationName:
      row.location_name,

    publishedAt:
      row.published_at,

    createdAt:
      row.created_at,

    expiresAt:
      row.expires_at,

    coverStoragePath:
      row.cover_storage_path,

    provider: {
      id:
        row.provider_id,

      fullName:
        row.provider_full_name,

      username:
        row.provider_username,

      avatarUrl:
        row.provider_avatar_url,

      rating:
        row.provider_rating,

      totalReviews:
        row.provider_total_reviews,

      verificationStatus:
        row.provider_verification_status,
    },
  };
}