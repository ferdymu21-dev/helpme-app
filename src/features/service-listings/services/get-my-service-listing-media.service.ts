import {
  getMyServiceListingMediaRepository,
} from "../repositories/service-listing-media.repository";

import type {
  ProviderServiceListingMedia,
} from "../types/service-listing-media.types";

import {
  validateAndNormalizeServiceListingMediaListingId,
} from "../validators/validate-service-listing-media";

export async function getMyServiceListingMediaService(
  listingId: string,
): Promise<ProviderServiceListingMedia[]> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  return getMyServiceListingMediaRepository(
    normalizedListingId,
  );
}