import { getPublicServiceListingMediaRepository } from "../repositories/service-listing-media.repository";

import type { ProviderServiceListingMedia } from "../types/service-listing-media.types";

import { validateAndNormalizeServiceListingMediaListingId } from "../validators/validate-service-listing-media";

export async function getPublicServiceListingMediaService(
  listingId: string,
): Promise<ProviderServiceListingMedia[]> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(listingId);

  return getPublicServiceListingMediaRepository(normalizedListingId);
}