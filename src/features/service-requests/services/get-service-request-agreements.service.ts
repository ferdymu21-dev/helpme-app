import { getServiceRequestAgreementsRepository } from "../repositories/get-service-request-agreements.repository";

import type { ServiceAgreement } from "../types/service-agreement.types";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function getServiceRequestAgreementsService(
  requestId: string,
): Promise<ServiceAgreement[]> {
  return getServiceRequestAgreementsRepository(
    validateServiceRequestId(requestId),
  );
}
