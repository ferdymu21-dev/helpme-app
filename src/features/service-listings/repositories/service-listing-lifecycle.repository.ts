import {
  supabase,
} from "@/lib/supabase/client";

import type {
  ServiceListingLifecycleInput,
  ServiceListingLifecycleResult,
} from "../types/service-listing.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseLifecycleListingId(
  value: unknown,
  expectedListingId: string,
  rpcName: string,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value)
  ) {
    throw new Error(
      `${rpcName} returned an invalid listing ID.`,
    );
  }

  if (
    value.toLowerCase() !==
    expectedListingId.toLowerCase()
  ) {
    throw new Error(
      `${rpcName} returned an unexpected listing ID.`,
    );
  }

  return value;
}

export async function pauseServiceListingRepository(
  payload: ServiceListingLifecycleInput,
): Promise<ServiceListingLifecycleResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "pause_service_listing",
    {
      p_listing_id:
        payload.listingId,
    },
  );

  if (error) {
    throw error;
  }

  return {
    listingId:
      parseLifecycleListingId(
        data,
        payload.listingId,
        "pause_service_listing",
      ),
  };
}

export async function resumeServiceListingRepository(
  payload: ServiceListingLifecycleInput,
): Promise<ServiceListingLifecycleResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "resume_service_listing",
    {
      p_listing_id:
        payload.listingId,
    },
  );

  if (error) {
    throw error;
  }

  return {
    listingId:
      parseLifecycleListingId(
        data,
        payload.listingId,
        "resume_service_listing",
      ),
  };
}

export async function archiveServiceListingRepository(
  payload: ServiceListingLifecycleInput,
): Promise<ServiceListingLifecycleResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "archive_service_listing",
    {
      p_listing_id:
        payload.listingId,
    },
  );

  if (error) {
    throw error;
  }

  return {
    listingId:
      parseLifecycleListingId(
        data,
        payload.listingId,
        "archive_service_listing",
      ),
  };
}