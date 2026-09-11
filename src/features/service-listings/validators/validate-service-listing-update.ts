import {
  validateAndNormalizeServiceListingEditableFields,
} from "./validate-service-listing-editable-fields";

import {
  validateAndNormalizeServiceListingId,
} from "./validate-service-listing-identity";

import type {
  ServiceListingEditableFields,
  UpdateServiceListingInput,
} from "../types/service-listing.types";

export function validateAndNormalizeServiceListingUpdate(
  payload: UpdateServiceListingInput,
): UpdateServiceListingInput {
  const listingId =
    validateAndNormalizeServiceListingId(
      payload.listingId,
    );

  const editableFields: ServiceListingEditableFields = {
    title:
      payload.title,

    category:
      payload.category,

    description:
      payload.description,

    deliverables:
      payload.deliverables,

    customerPreparation:
      payload.customerPreparation,

    priceFrom:
      payload.priceFrom,

    isNegotiable:
      payload.isNegotiable,

    serviceMode:
      payload.serviceMode,

    locationName:
      payload.locationName,
  };

  const normalizedFields =
    validateAndNormalizeServiceListingEditableFields(
      editableFields,
    );

  return {
    listingId,

    ...normalizedFields,
  };
}