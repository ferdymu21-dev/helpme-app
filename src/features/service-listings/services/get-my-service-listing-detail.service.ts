import {
  getMyServiceListingDetailRepository,
} from "../repositories/service-listing-read.repository";

import {
  validateAndNormalizeServiceListingId,
} from "../validators/validate-service-listing-identity";

import type {
  GetMyServiceListingDetailInput,
} from "../types/service-listing.types";

import type {
  ProviderServiceListing,
} from "../types/service-listing-read.types";

export async function getMyServiceListingDetailService(
  payload: GetMyServiceListingDetailInput,
): Promise<ProviderServiceListing | null> {
  const listingId =
    validateAndNormalizeServiceListingId(
      payload.listingId,
    );

  return getMyServiceListingDetailRepository(
    listingId,
  );
}