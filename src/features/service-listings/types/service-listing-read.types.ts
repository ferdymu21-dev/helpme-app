import type {
  ServiceListingStatusValue,
} from "../constants/service-listing-status";

import type {
  ServiceModeValue,
} from "../constants/service-mode";

export type ServiceListingBlockedFromStatus =
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED";

export interface ProviderServiceListing {
  id: string;

  title: string;

  category: string;

  description: string;

  deliverables: string;

  customerPreparation: string | null;

  priceFrom: number;

  isNegotiable: boolean;

  serviceMode: ServiceModeValue;

  locationName: string | null;

  status: ServiceListingStatusValue;

  publishedAt: string | null;

  activatedAt: string | null;

  expiresAt: string | null;

  pausedAt: string | null;

  blockedAt: string | null;

  blockedReason: string | null;

  blockedFromStatus:
    | ServiceListingBlockedFromStatus
    | null;

  archivedAt: string | null;

  createdAt: string;

  updatedAt: string;

  coverStoragePath: string | null;
}

export interface PublicServiceListingProvider {
  id: string;

  fullName: string | null;

  username: string | null;

  avatarUrl: string | null;

  rating: number | null;

  totalReviews: number | null;

  verificationStatus: string | null;
}

export interface PublicServiceListingCard {
  id: string;

  title: string;

  category: string;

  description: string;

  priceFrom: number;

  isNegotiable: boolean;

  serviceMode: ServiceModeValue;

  locationName: string | null;

  createdAt: string;

  expiresAt: string;

  coverStoragePath: string | null;

  provider: PublicServiceListingProvider;
}

export interface PublicServiceListingDetail {
  id: string;

  title: string;

  category: string;

  description: string;

  deliverables: string;

  customerPreparation: string | null;

  priceFrom: number;

  isNegotiable: boolean;

  serviceMode: ServiceModeValue;

  locationName: string | null;

  publishedAt: string;

  createdAt: string;

  expiresAt: string;

  coverStoragePath: string | null;

  provider: PublicServiceListingProvider;
}

/**
 * totalCount:
 *
 * - number when the RPC returned at least one row
 * - 0 when page 1 itself is empty
 * - null when a later page is empty, because
 *   count(*) over() produces no row from which the total
 *   could be recovered
 */
export interface PaginatedServiceListingResult<T> {
  items: T[];

  totalCount: number | null;

  page: number;

  pageSize: number;
}

/**
 * Normalized raw row returned by
 * get_my_service_listings().
 *
 * Runtime parsing happens before this contract is trusted.
 */
export interface MyServiceListingRpcRow {
  id: string;

  title: string;

  category: string;

  description: string;

  deliverables: string;

  customer_preparation: string | null;

  price_from: number;

  is_negotiable: boolean;

  service_mode: ServiceModeValue;

  location_name: string | null;

  status: ServiceListingStatusValue;

  published_at: string | null;

  activated_at: string | null;

  expires_at: string | null;

  paused_at: string | null;

  blocked_at: string | null;

  blocked_reason: string | null;

  blocked_from_status:
    | ServiceListingBlockedFromStatus
    | null;

  archived_at: string | null;

  created_at: string;

  updated_at: string;

  cover_storage_path: string | null;

  total_count: number;
}

/**
 * Exact row returned by
 * get_my_service_listing_detail().
 *
 * The projection is identical to the Provider list row
 * except that a single-detail RPC has no total_count.
 */
export type MyServiceListingDetailRpcRow =
  Omit<
    MyServiceListingRpcRow,
    "total_count"
  >;

/**
 * Normalized raw row returned by
 * get_public_service_listings().
 */
export interface PublicServiceListingRpcRow {
  id: string;

  provider_id: string;

  title: string;

  category: string;

  description: string;

  price_from: number;

  is_negotiable: boolean;

  service_mode: ServiceModeValue;

  location_name: string | null;

  created_at: string;

  expires_at: string;

  cover_storage_path: string | null;

  provider_full_name: string | null;

  provider_username: string | null;

  provider_avatar_url: string | null;

  provider_rating: number | null;

  provider_total_reviews: number | null;

  provider_verification_status: string | null;

  total_count: number;
}

/**
 * Normalized raw row returned by
 * get_public_service_listing_detail().
 */
export interface PublicServiceListingDetailRpcRow {
  id: string;

  provider_id: string;

  title: string;

  category: string;

  description: string;

  deliverables: string;

  customer_preparation: string | null;

  price_from: number;

  is_negotiable: boolean;

  service_mode: ServiceModeValue;

  location_name: string | null;

  published_at: string;

  created_at: string;

  expires_at: string;

  cover_storage_path: string | null;

  provider_full_name: string | null;

  provider_username: string | null;

  provider_avatar_url: string | null;

  provider_rating: number | null;

  provider_total_reviews: number | null;

  provider_verification_status: string | null;
}