import {
  validateAndNormalizeServiceListingEditableFields,
} from "./validate-service-listing-editable-fields";

import type {
  CreateServiceListingDraftInput,
} from "../types/service-listing.types";

export function validateAndNormalizeServiceListingDraft(
  payload: CreateServiceListingDraftInput,
): CreateServiceListingDraftInput {
  return validateAndNormalizeServiceListingEditableFields(
    payload,
  );
}