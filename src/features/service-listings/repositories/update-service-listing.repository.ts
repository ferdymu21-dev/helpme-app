import {
  supabase,
} from "@/lib/supabase/client";

import type {
  UpdateServiceListingInput,
  UpdateServiceListingResult,
} from "../types/service-listing.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseUpdatedListingId(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value)
  ) {
    throw new Error(
      "update_service_listing returned an invalid listing ID.",
    );
  }

  return value;
}

/**
 * Browser-authenticated Service Listing update.
 *
 * Provider identity and lifecycle authorization are
 * intentionally resolved by update_service_listing().
 */
export async function updateServiceListingRepository(
  payload: UpdateServiceListingInput,
): Promise<UpdateServiceListingResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "update_service_listing",
    {
      p_listing_id:
        payload.listingId,

      p_title:
        payload.title,

      p_category:
        payload.category,

      p_custom_category:
        payload.customCategory,

      p_description:
        payload.description,

      p_deliverables:
        payload.deliverables,

      p_customer_preparation:
        payload.customerPreparation,

      p_price_from:
        payload.priceFrom,

      p_is_negotiable:
        payload.isNegotiable,

      p_service_mode:
        payload.serviceMode,

      p_location_name:
        payload.locationName,
    },
  );

  if (error) {
    throw error;
  }

  const listingId =
    parseUpdatedListingId(
      data,
    );

  if (
    listingId.toLowerCase() !==
    payload.listingId.toLowerCase()
  ) {
    throw new Error(
      "update_service_listing returned an unexpected listing ID.",
    );
  }

  return {
    listingId,
  };
}