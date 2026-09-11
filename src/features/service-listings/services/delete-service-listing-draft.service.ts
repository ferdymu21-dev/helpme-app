import {
  deleteServiceListingDraftRepository,
} from "../repositories/delete-service-listing-draft.repository";

import {
  validateAndNormalizeServiceListingId,
} from "../validators/validate-service-listing-identity";

import type {
  DeleteServiceListingDraftInput,
  DeleteServiceListingDraftResult,
} from "../types/service-listing.types";

export async function deleteServiceListingDraftService(
  payload: DeleteServiceListingDraftInput,
): Promise<DeleteServiceListingDraftResult> {
  const listingId =
    validateAndNormalizeServiceListingId(
      payload.listingId,
    );

  return deleteServiceListingDraftRepository({
    listingId,
  });
}