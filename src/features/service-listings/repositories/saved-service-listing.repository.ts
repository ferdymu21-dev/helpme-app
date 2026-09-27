import { supabase } from "@/lib/supabase/client";

import { ServiceListingConfig } from "../constants/service-listing-config";

import {
  mapPublicServiceListingRpcRow,
  parsePublicServiceListingRpcRows,
} from "../mappers/service-listing-read.mapper";

import type {
  PaginatedServiceListingResult,
  PublicServiceListingCard,
} from "../types/service-listing-read.types";

export interface GetSavedServiceListingsQuery {
  page?: number;

  pageSize?: number;
}

interface SavedServiceListingIdRpcRow {
  service_listing_id: string;
}

const POSTGRES_INTEGER_MAX =
  2_147_483_647;

function normalizePage(
  value: number | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    return ServiceListingConfig.pagination.defaultPage;
  }

  return Math.min(
    value,
    POSTGRES_INTEGER_MAX,
  );
}

function normalizePageSize(
  value: number | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value)
  ) {
    return ServiceListingConfig.pagination.defaultPageSize;
  }

  return Math.max(
    1,
    Math.min(
      value,
      ServiceListingConfig.pagination.maxPageSize,
    ),
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function parseSavedServiceListingIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "get_my_saved_service_listing_ids returned an invalid result.",
    );
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.service_listing_id !== "string" ||
      item.service_listing_id.trim().length === 0
    ) {
      throw new Error(
        "get_my_saved_service_listing_ids returned an invalid row.",
      );
    }

    const row: SavedServiceListingIdRpcRow = {
      service_listing_id:
        item.service_listing_id,
    };

    return row.service_listing_id;
  });
}

function resolveTotalCount(
  rows: ReadonlyArray<{
    total_count: number;
  }>,
  page: number,
): number | null {
  if (rows.length === 0) {
    return page === 1
      ? 0
      : null;
  }

  const totalCount =
    rows[0].total_count;

  const inconsistent =
    rows.some(
      (row) =>
        row.total_count !== totalCount,
    );

  if (inconsistent) {
    throw new Error(
      "Saved Service Listing RPC returned inconsistent total_count values.",
    );
  }

  return totalCount;
}

export async function getSavedServiceListingIdsRepository(): Promise<string[]> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_saved_service_listing_ids",
  );

  if (error) {
    throw error;
  }

  return parseSavedServiceListingIds(
    data,
  );
}

export async function saveServiceListingRepository(
  listingId: string,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "save_service_listing",
    {
      p_listing_id: listingId,
    },
  );

  if (error) {
    throw error;
  }
}

export async function unsaveServiceListingRepository(
  listingId: string,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "unsave_service_listing",
    {
      p_listing_id: listingId,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getSavedServiceListingsRepository(
  query: GetSavedServiceListingsQuery = {},
): Promise<
  PaginatedServiceListingResult<PublicServiceListingCard>
> {
  const page =
    normalizePage(query.page);

  const pageSize =
    normalizePageSize(
      query.pageSize,
    );

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_saved_service_listings",
    {
      p_page: page,

      p_page_size: pageSize,
    },
  );

  if (error) {
    throw error;
  }

  const rows =
    parsePublicServiceListingRpcRows(
      data,
    );

  return {
    items:
      rows.map(
        mapPublicServiceListingRpcRow,
      ),

    totalCount:
      resolveTotalCount(
        rows,
        page,
      ),

    page,

    pageSize,
  };
}