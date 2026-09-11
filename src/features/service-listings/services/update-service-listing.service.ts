import {
  updateServiceListingRepository,
} from "../repositories/update-service-listing.repository";

import {
  validateAndNormalizeServiceListingUpdate,
} from "../validators/validate-service-listing-update";

import type {
  UpdateServiceListingInput,
  UpdateServiceListingResult,
} from "../types/service-listing.types";

export async function updateServiceListingService(
  payload: UpdateServiceListingInput,
): Promise<UpdateServiceListingResult> {
  const normalizedPayload =
    validateAndNormalizeServiceListingUpdate(
      payload,
    );

  return updateServiceListingRepository(
    normalizedPayload,
  );
}