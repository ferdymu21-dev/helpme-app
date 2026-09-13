import { supabase } from "@/lib/supabase/client";

import type {
  CreateServiceRequestInput,
  CreateServiceRequestResult,
} from "../types/service-request.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCreatedRequestId(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error("create_service_request returned an invalid request ID.");
  }

  return value;
}

/**
 * Browser-authenticated mutation.
 *
 * Customer identity is intentionally NOT supplied here.
 * Provider identity is intentionally NOT supplied here.
 *
 * create_service_request() derives both transaction
 * participants authoritatively in the database.
 */
export async function createServiceRequestRepository(
  payload: CreateServiceRequestInput,
): Promise<CreateServiceRequestResult> {
  const { data, error } = await supabase.rpc("create_service_request", {
    p_listing_id: payload.listingId,

    p_request_description: payload.requestDescription,

    p_needed_at: payload.neededAt,

    p_service_mode: payload.serviceMode,

    p_location_name: payload.locationName,

    p_budget: payload.budget,
  });

  if (error) {
    throw error;
  }

  return {
    requestId: parseCreatedRequestId(data),
  };
}
