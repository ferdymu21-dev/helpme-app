import {
  createServiceListingDraftRepository,
} from "../repositories/create-service-listing-draft.repository";

import {
  validateAndNormalizeServiceListingDraft,
} from "../validators/validate-service-listing-draft";

import type {
  CreateServiceListingDraftInput,
  CreateServiceListingDraftResult,
} from "../types/service-listing.types";

export async function createServiceListingDraftService(
  payload: CreateServiceListingDraftInput,
): Promise<CreateServiceListingDraftResult> {
  const normalizedPayload =
    validateAndNormalizeServiceListingDraft(
      payload,
    );

  return createServiceListingDraftRepository(
    normalizedPayload,
  );
}