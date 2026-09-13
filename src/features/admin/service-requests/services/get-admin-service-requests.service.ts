import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServiceRequestsRepository } from "../repositories/admin-service-request.repository";

import {
  ADMIN_SERVICE_REQUEST_STATUSES,
  type AdminServiceRequestListResponse,
  type AdminServiceRequestStatus,
} from "../types/admin-service-request.types";

export interface GetAdminServiceRequestsInput {
  page?: number;
  pageSize?: number;

  status?: string | null;
  search?: string | null;
}

function isServiceRequestStatus(
  value: string,
): value is AdminServiceRequestStatus {
  return ADMIN_SERVICE_REQUEST_STATUSES.some((status) => status === value);
}

export async function getAdminServiceRequestsService(
  input: GetAdminServiceRequestsInput,
): Promise<AdminServiceRequestListResponse> {
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

  let status: AdminServiceRequestStatus | null = null;

  if (rawStatus) {
    if (!isServiceRequestStatus(rawStatus)) {
      throw new Error("INVALID_SERVICE_REQUEST_STATUS");
    }

    status = rawStatus;
  }

  const search = input.search?.trim() || null;

  if (search && search.length > 100) {
    throw new Error("SEARCH_TOO_LONG");
  }

  return getAdminServiceRequestsRepository({
    page,
    pageSize,

    status,

    search,
  });
}
