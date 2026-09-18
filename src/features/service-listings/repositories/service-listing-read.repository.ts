import { supabase } from "@/lib/supabase/client";

import { ServiceListingConfig } from "../constants/service-listing-config";

import {
  mapMyServiceListingDetailRpcRow,
  mapMyServiceListingRpcRow,
  mapPublicServiceListingDetailRpcRow,
  mapPublicServiceListingRpcRow,
  parseMyServiceListingDetailRpcRow,
  parseMyServiceListingRpcRows,
  parsePublicServiceListingDetailRpcRow,
  parsePublicServiceListingRpcRows,
  parseMyServiceListingStatusCountsRpcRow,
} from "../mappers/service-listing-read.mapper";

import type {
  GetMyServiceListingsQuery,
  GetPublicServiceListingsQuery,
} from "../types/service-listing.types";

import type {
  MyServiceListingStatusCounts,
  PaginatedServiceListingResult,
  ProviderServiceListing,
  PublicServiceListingCard,
  PublicServiceListingDetail,
} from "../types/service-listing-read.types";

const POSTGRES_INTEGER_MAX = 2_147_483_647;

function normalizePage(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return ServiceListingConfig.pagination.defaultPage;
  }

  return Math.min(value, POSTGRES_INTEGER_MAX);
}

function normalizePageSize(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return ServiceListingConfig.pagination.defaultPageSize;
  }

  return Math.max(
    1,
    Math.min(value, ServiceListingConfig.pagination.maxPageSize),
  );
}

function normalizeNullableText(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function resolveTotalCount(
  rows: ReadonlyArray<{
    total_count: number;
  }>,
  page: number,
): number | null {
  if (rows.length === 0) {
    return page === 1 ? 0 : null;
  }

  const totalCount = rows[0].total_count;

  const hasInconsistentTotal = rows.some(
    (row) => row.total_count !== totalCount,
  );

  if (hasInconsistentTotal) {
    throw new Error(
      "Service Listing RPC returned inconsistent total_count values.",
    );
  }

  return totalCount;
}

export async function getMyServiceListingsRepository(
  query: GetMyServiceListingsQuery = {},
): Promise<PaginatedServiceListingResult<ProviderServiceListing>> {
  const page = normalizePage(query.page);

  const pageSize = normalizePageSize(query.pageSize);

  const { data, error } = await supabase.rpc(
    "get_my_service_listings_by_status",
    {
      p_page: page,

      p_page_size: pageSize,

      p_status: query.status ?? null,
    },
  );

  if (error) {
    throw error;
  }

  const rows = parseMyServiceListingRpcRows(data);

  return {
    items: rows.map(mapMyServiceListingRpcRow),

    totalCount: resolveTotalCount(rows, page),

    page,

    pageSize,
  };
}

export async function getMyServiceListingStatusCountsRepository(): Promise<MyServiceListingStatusCounts> {
  const { data, error } = await supabase
    .rpc("get_my_service_listing_status_counts")
    .single();

  if (error) {
    throw error;
  }

  const row = parseMyServiceListingStatusCountsRpcRow(data);

  return {
    totalCount: row.total_count,

    activeCount: row.active_count,

    draftCount: row.draft_count,

    paymentPendingCount: row.payment_pending_count,

    pausedCount: row.paused_count,

    expiredCount: row.expired_count,

    blockedCount: row.blocked_count,

    archivedCount: row.archived_count,
  };
}

export async function getMyServiceListingDetailRepository(
  listingId: string,
): Promise<ProviderServiceListing | null> {
  const { data, error } = await supabase
    .rpc("get_my_service_listing_detail", {
      p_listing_id: listingId,
    })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data === null) {
    return null;
  }

  const row = parseMyServiceListingDetailRpcRow(data);

  return mapMyServiceListingDetailRpcRow(row);
}

export async function getPublicServiceListingsRepository(
  query: GetPublicServiceListingsQuery = {},
): Promise<PaginatedServiceListingResult<PublicServiceListingCard>> {
  const page = normalizePage(query.page);

  const pageSize = normalizePageSize(query.pageSize);

  const { data, error } = await supabase.rpc("get_public_service_listings", {
    p_page: page,

    p_page_size: pageSize,

    p_category: normalizeNullableText(query.category),

    p_service_mode: query.serviceMode ?? null,

    p_search: normalizeNullableText(query.search),

    p_provider_id: normalizeNullableText(query.providerId),
  });

  if (error) {
    throw error;
  }

  const rows = parsePublicServiceListingRpcRows(data);

  return {
    items: rows.map(mapPublicServiceListingRpcRow),

    totalCount: resolveTotalCount(rows, page),

    page,

    pageSize,
  };
}

export async function getPublicServiceListingDetailRepository(
  listingId: string,
): Promise<PublicServiceListingDetail | null> {
  const normalizedListingId = listingId.trim();

  if (normalizedListingId.length === 0) {
    throw new Error("Service Listing identity is required.");
  }

  const { data, error } = await supabase
    .rpc("get_public_service_listing_detail", {
      p_listing_id: normalizedListingId,
    })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data === null) {
    return null;
  }

  const row = parsePublicServiceListingDetailRpcRow(data);

  return mapPublicServiceListingDetailRpcRow(row);
}