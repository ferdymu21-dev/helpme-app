import {
  supabase,
} from "@/lib/supabase/client";

import type {
  DeleteServiceListingDraftInput,
  DeleteServiceListingDraftResult,
} from "../types/service-listing.types";

/**
 * Browser-authenticated hard delete for an eligible draft.
 *
 * Authorization, ownership, DRAFT-only enforcement,
 * dependency/history checks, and the final DELETE all live
 * inside delete_service_listing_draft().
 */
export async function deleteServiceListingDraftRepository(
  payload: DeleteServiceListingDraftInput,
): Promise<DeleteServiceListingDraftResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "delete_service_listing_draft",
    {
      p_listing_id:
        payload.listingId,
    },
  );

  if (error) {
    throw error;
  }

  if (data !== true) {
    throw new Error(
      "delete_service_listing_draft returned an invalid result.",
    );
  }

  return {
    deleted: true,
  };
}