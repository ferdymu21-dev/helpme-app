import { getPublicServiceListingDetailRepository } from "../repositories/service-listing-read.repository";

import type { PublicServiceListingDetail } from "../types/service-listing-read.types";

export async function getPublicServiceListingDetailService(
  listingId: string,
): Promise<PublicServiceListingDetail | null> {
  const normalizedListingId = listingId.trim();

  if (normalizedListingId.length === 0) {
    throw new Error("Service Listing identity is required.");
  }

  return getPublicServiceListingDetailRepository(normalizedListingId);
}