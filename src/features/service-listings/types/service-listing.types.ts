import type {
  ServiceListingImageKindValue,
} from "../constants/service-listing-image-kind";

import type {
  ServiceListingStatusValue,
} from "../constants/service-listing-status";

import type {
  ServiceModeValue,
} from "../constants/service-mode";

/**
 * Editable Service Listing content.
 *
 * This intentionally mirrors the editable fields exposed
 * by M4A create_service_listing_draft() and
 * update_service_listing().
 *
 * Lifecycle/publication fields are intentionally excluded.
 */
export interface ServiceListingEditableFields {
  title: string;

  category: string;

  description: string;

  deliverables: string;

  customerPreparation: string | null;

  priceFrom: number;

  isNegotiable: boolean;

  serviceMode: ServiceModeValue;

  locationName: string | null;
}

/**
 * Input accepted by the create-draft application layer.
 *
 * providerId is intentionally absent:
 * the authenticated actor is resolved by the database RPC.
 */
export type CreateServiceListingDraftInput =
  ServiceListingEditableFields;

/**
 * Update is currently full editable-content replacement.
 *
 * Lifecycle fields such as status, expiresAt, publishedAt,
 * blockedAt, and archivedAt cannot be supplied here.
 */
export interface UpdateServiceListingInput
  extends ServiceListingEditableFields {
  listingId: string;
}

/**
 * Provider lifecycle operations.
 *
 * Provider identity is intentionally absent because M4B
 * resolves the actor from auth.uid().
 */
export interface ServiceListingLifecycleInput {
  listingId: string;
}

/**
 * Provider-owned listing page query.
 */
export interface GetMyServiceListingsQuery {
  page?: number;

  pageSize?: number;
}

/**
 * Provider-owned single listing retrieval.
 *
 * Provider identity is intentionally absent because the
 * RPC resolves ownership from auth.uid().
 */
export interface GetMyServiceListingDetailInput {
  listingId: string;
}

/**
 * Public Service discovery query.
 */
export interface GetPublicServiceListingsQuery {
  page?: number;

  pageSize?: number;

  category?: string | null;

  serviceMode?: ServiceModeValue | null;

  search?: string | null;

  providerId?: string | null;
}

/**
 * Canonical Service Listing domain record.
 *
 * This represents the listing entity itself, not the
 * exact raw shape returned by a particular Supabase RPC.
 * RPC-specific row contracts will be kept at the repository
 * boundary when F5.E is implemented.
 */
export interface ServiceListing {
  id: string;

  providerId: string;

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
    | "ACTIVE"
    | "PAUSED"
    | "EXPIRED"
    | null;

  archivedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

/**
 * Service Listing media entity.
 */
export interface ServiceListingImage {
  id: string;

  serviceListingId: string;

  storagePath: string;

  kind: ServiceListingImageKindValue;

  sortOrder: number;

  createdAt: string;
}

/**
 * Result produced by create_service_listing_draft().
 */
export interface CreateServiceListingDraftResult {
  listingId: string;
}

/**
 * Result produced by update_service_listing().
 */
export interface UpdateServiceListingResult {
  listingId: string;
}

/**
 * Input accepted by delete_service_listing_draft().
 *
 * Provider identity is intentionally absent because the
 * authenticated actor is resolved by the database RPC.
 */
export interface DeleteServiceListingDraftInput {
  listingId: string;
}

/**
 * Result produced by delete_service_listing_draft().
 */
export interface DeleteServiceListingDraftResult {
  deleted: boolean;
}

/**
 * Common Provider lifecycle result.
 *
 * M4B pause/resume/archive RPCs return the listing UUID.
 */
export interface ServiceListingLifecycleResult {
  listingId: string;
}

/**
 * Application-level result of the trusted M4C1
 * first-free publication operation.
 *
 * activated=false means the free entitlement was not
 * available and the caller may proceed to the paid
 * publication flow later in F7.
 */
export interface FirstFreeServiceListingPublicationResult {
  activated: boolean;

  listingId: string;

  publicationPeriodId: string | null;

  startsAt: string | null;

  endsAt: string | null;
}

/**
 * Trusted server input for first-free publication.
 *
 * Configuration values are intentionally NOT caller input.
 * The server repository must obtain them from
 * ServiceListingConfig.
 */
export interface ClaimFirstFreeServiceListingPublicationInput {
  listingId: string;

  providerId: string;
}