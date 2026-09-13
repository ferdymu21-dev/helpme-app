import { cancelServiceRequestRepository } from "../repositories/service-request-customer-lifecycle.repository";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function cancelServiceRequestService(
  requestId: string,
  reason: string,
): Promise<string> {
  const normalizedReason = reason.trim();

  if (!normalizedReason) {
    throw new Error("Alasan pembatalan wajib diisi.");
  }

  return cancelServiceRequestRepository(
    validateServiceRequestId(requestId),
    normalizedReason,
  );
}
