import {
  resumeServiceListingRepository,
} from "../repositories/service-listing-lifecycle.repository";

import {
  validateAndNormalizeServiceListingId,
} from "../validators/validate-service-listing-identity";

import type {
  ServiceListingLifecycleInput,
  ServiceListingLifecycleResult,
} from "../types/service-listing.types";

export async function resumeServiceListingService(
  payload: ServiceListingLifecycleInput,
): Promise<ServiceListingLifecycleResult> {
  const listingId =
    validateAndNormalizeServiceListingId(
      payload.listingId,
    );

  return resumeServiceListingRepository({
    listingId,
  });
}