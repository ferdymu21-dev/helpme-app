import { getPublicServiceListingsRepository } from "../repositories/service-listing-read.repository";

import type { GetPublicServiceListingsQuery } from "../types/service-listing.types";

import type {
  PaginatedServiceListingResult,
  PublicServiceListingCard,
} from "../types/service-listing-read.types";

export async function getPublicServiceListingsService(
  query: GetPublicServiceListingsQuery = {},
): Promise<PaginatedServiceListingResult<PublicServiceListingCard>> {
  return getPublicServiceListingsRepository(query);
}
