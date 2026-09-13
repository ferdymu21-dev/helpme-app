import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServiceRequestDetailRepository } from "../repositories/admin-service-request.repository";

import type { AdminServiceRequestDetail } from "../types/admin-service-request.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdminServiceRequestDetailService(
  serviceRequestId: string,
): Promise<AdminServiceRequestDetail> {
  await requireAdmin();

  if (!UUID_PATTERN.test(serviceRequestId)) {
    throw new Error("INVALID_SERVICE_REQUEST_ID");
  }

  const request =
    await getAdminServiceRequestDetailRepository(serviceRequestId);

  if (!request) {
    throw new Error("SERVICE_REQUEST_NOT_FOUND");
  }

  return request;
}
