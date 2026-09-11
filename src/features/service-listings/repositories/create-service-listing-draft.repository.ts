import {
  supabase,
} from "@/lib/supabase/client";

import type {
  CreateServiceListingDraftInput,
  CreateServiceListingDraftResult,
} from "../types/service-listing.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCreatedListingId(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value)
  ) {
    throw new Error(
      "create_service_listing_draft returned an invalid listing ID.",
    );
  }

  return value;
}

/**
 * Browser-authenticated mutation.
 *
 * Provider identity is intentionally NOT supplied here.
 * create_service_listing_draft() resolves the actor through
 * require_current_service_actor() / auth.uid().
 */
export async function createServiceListingDraftRepository(
  payload: CreateServiceListingDraftInput,
): Promise<CreateServiceListingDraftResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_service_listing_draft",
    {
      p_title:
        payload.title,

      p_category:
        payload.category,

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

  return {
    listingId:
      parseCreatedListingId(
        data,
      ),
  };
}