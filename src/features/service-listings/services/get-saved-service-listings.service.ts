import {
  getSavedServiceListingsRepository,
  type GetSavedServiceListingsQuery,
} from "../repositories/saved-service-listing.repository";

import type {
  PaginatedServiceListingResult,
  PublicServiceListingCard,
} from "../types/service-listing-read.types";

export async function getSavedServiceListingsService(
  query: GetSavedServiceListingsQuery = {},
): Promise<
  PaginatedServiceListingResult<PublicServiceListingCard>
> {
  return getSavedServiceListingsRepository(
    query,
  );
}