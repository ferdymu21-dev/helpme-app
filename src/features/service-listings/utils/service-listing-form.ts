import {
  ServiceMode,
} from "../constants/service-mode";

import type {
  ServiceListingEditableFields,
} from "../types/service-listing.types";

import type {
  ProviderServiceListing,
} from "../types/service-listing-read.types";

import type {
  ServiceListingFormValues,
} from "../types/service-listing-form.types";

export function createEmptyServiceListingFormValues(): ServiceListingFormValues {
  return {
    title:
      "",

    category:
      "",

    description:
      "",

    deliverables:
      "",

    customerPreparation:
      "",

    priceFrom:
      "",

    isNegotiable:
      false,

    serviceMode:
      ServiceMode.ONLINE,

    locationName:
      "",
  };
}

export function createServiceListingFormValuesFromListing(
  listing: ProviderServiceListing,
): ServiceListingFormValues {
  return {
    title:
      listing.title,

    category:
      listing.category,

    description:
      listing.description,

    deliverables:
      listing.deliverables,

    customerPreparation:
      listing.customerPreparation ??
      "",

    priceFrom:
      String(
        listing.priceFrom,
      ),

    isNegotiable:
      listing.isNegotiable,

    serviceMode:
      listing.serviceMode,

    locationName:
      listing.locationName ??
      "",
  };
}

export function createServiceListingEditableFieldsFromForm(
  values: ServiceListingFormValues,
): ServiceListingEditableFields {
  const normalizedPrice =
    values.priceFrom.trim();

  const priceFrom =
    normalizedPrice
      ? Number(
          normalizedPrice,
        )
      : 0;

  return {
    title:
      values.title,

    category:
      values.category,

    description:
      values.description,

    deliverables:
      values.deliverables,

    customerPreparation:
      values.customerPreparation,

    priceFrom,

    isNegotiable:
      values.isNegotiable,

    serviceMode:
      values.serviceMode,

    locationName:
      values.locationName,
  };
}

export function areServiceListingFormValuesEqual(
  first: ServiceListingFormValues,
  second: ServiceListingFormValues,
): boolean {
  return (
    first.title ===
      second.title &&
    first.category ===
      second.category &&
    first.description ===
      second.description &&
    first.deliverables ===
      second.deliverables &&
    first.customerPreparation ===
      second.customerPreparation &&
    first.priceFrom ===
      second.priceFrom &&
    first.isNegotiable ===
      second.isNegotiable &&
    first.serviceMode ===
      second.serviceMode &&
    first.locationName ===
      second.locationName
  );
}