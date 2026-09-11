import {
  getMyServiceListingsRepository,
} from "../repositories/service-listing-read.repository";

import type {
  GetMyServiceListingsQuery,
} from "../types/service-listing.types";

import type {
  PaginatedServiceListingResult,
  ProviderServiceListing,
} from "../types/service-listing-read.types";

export async function getMyServiceListingsService(
  query: GetMyServiceListingsQuery = {},
): Promise<
  PaginatedServiceListingResult<
    ProviderServiceListing
  >
> {
  return getMyServiceListingsRepository(
    query,
  );
}