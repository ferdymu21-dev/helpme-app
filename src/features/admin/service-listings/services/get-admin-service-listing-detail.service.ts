import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServiceListingDetailRepository } from "../repositories/admin-service-listing.repository";

import type { AdminServiceListingDetail } from "../types/admin-service-listing.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdminServiceListingDetailService(
  serviceListingId: string,
): Promise<AdminServiceListingDetail> {
  await requireAdmin();

  if (!UUID_PATTERN.test(serviceListingId)) {
    throw new Error("INVALID_SERVICE_LISTING_ID");
  }

  const listing =
    await getAdminServiceListingDetailRepository(serviceListingId);

  if (!listing) {
    throw new Error("SERVICE_LISTING_NOT_FOUND");
  }

  return listing;
}
