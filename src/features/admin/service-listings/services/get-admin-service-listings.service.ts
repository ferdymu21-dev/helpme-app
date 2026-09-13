import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServiceListingsRepository } from "../repositories/admin-service-listing.repository";

import {
  ADMIN_SERVICE_LISTING_STATUSES,
  type AdminServiceListingListResponse,
  type AdminServiceListingStatus,
} from "../types/admin-service-listing.types";

export interface GetAdminServiceListingsInput {
  page?: number;
  pageSize?: number;

  status?: string | null;
  search?: string | null;
}

function isServiceListingStatus(
  value: string,
): value is AdminServiceListingStatus {
  return ADMIN_SERVICE_LISTING_STATUSES.some((status) => status === value);
}

export async function getAdminServiceListingsService(
  input: GetAdminServiceListingsInput,
): Promise<AdminServiceListingListResponse> {
  await requireAdmin();

  const page = input.page ?? 1;

  const pageSize = input.pageSize ?? 20;

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("INVALID_PAGE");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error("INVALID_PAGE_SIZE");
  }

  const rawStatus = input.status?.trim() || null;

  let status: AdminServiceListingStatus | null = null;

  if (rawStatus) {
    if (!isServiceListingStatus(rawStatus)) {
      throw new Error("INVALID_SERVICE_LISTING_STATUS");
    }

    status = rawStatus;
  }

  const search = input.search?.trim() || null;

  if (search && search.length > 100) {
    throw new Error("SEARCH_TOO_LONG");
  }

  return getAdminServiceListingsRepository({
    page,
    pageSize,

    status,

    search,
  });
}
