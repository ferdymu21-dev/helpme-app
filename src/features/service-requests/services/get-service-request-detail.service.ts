import { getServiceRequestDetailRepository } from "../repositories/get-service-request-detail.repository";

import type { ServiceRequestDetail } from "../types/service-request-read.types";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function getServiceRequestDetailService(
  requestId: string,
): Promise<ServiceRequestDetail | null> {
  return getServiceRequestDetailRepository(validateServiceRequestId(requestId));
}
