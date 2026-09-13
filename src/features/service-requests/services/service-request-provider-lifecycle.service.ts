import {
  beginServiceRequestNegotiationRepository,
  declineServiceRequestRepository,
} from "../repositories/service-request-provider-lifecycle.repository";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function beginServiceRequestNegotiationService(
  requestId: string,
): Promise<string> {
  return beginServiceRequestNegotiationRepository(
    validateServiceRequestId(requestId),
  );
}

export async function declineServiceRequestService(
  requestId: string,
  reason: string,
): Promise<string> {
  const normalizedReason = reason.trim();

  if (!normalizedReason) {
    throw new Error("Alasan penolakan wajib diisi.");
  }

  return declineServiceRequestRepository(
    validateServiceRequestId(requestId),
    normalizedReason,
  );
}
