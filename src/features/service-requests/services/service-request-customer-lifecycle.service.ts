import {
  acceptServiceCompletionRepository,
  cancelServiceRequestRepository,
  requestServiceCompletionRevisionRepository,
} from "../repositories/service-request-customer-lifecycle.repository";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function requestServiceCompletionRevisionService(
  requestId: string,
  revisionReason: string,
): Promise<string> {
  const normalizedReason = revisionReason.trim();

  if (!normalizedReason) {
    throw new Error("Alasan revisi wajib diisi.");
  }

  return requestServiceCompletionRevisionRepository(
    validateServiceRequestId(requestId),
    normalizedReason,
  );
}

export async function acceptServiceCompletionService(
  requestId: string,
): Promise<string> {
  return acceptServiceCompletionRepository(
    validateServiceRequestId(requestId),
  );
}

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
