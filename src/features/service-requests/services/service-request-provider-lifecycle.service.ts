import {
  beginServiceRequestNegotiationRepository,
  declineServiceRequestRepository,
  startServiceRequestWorkRepository,
  submitServiceRequestWorkRepository,
} from "../repositories/service-request-provider-lifecycle.repository";

import { validateServiceRequestId } from "../validators/validate-service-request-identity";

export async function beginServiceRequestNegotiationService(
  requestId: string,
): Promise<string> {
  return beginServiceRequestNegotiationRepository(
    validateServiceRequestId(requestId),
  );
}

export async function startServiceRequestWorkService(
  requestId: string,
): Promise<string> {
  return startServiceRequestWorkRepository(
    validateServiceRequestId(requestId),
  );
}

export async function submitServiceRequestWorkService(
  requestId: string,
  providerNote: string,
): Promise<string> {
  const normalizedNote = providerNote.trim();

  if (!normalizedNote) {
    throw new Error("Catatan hasil pekerjaan wajib diisi.");
  }

  return submitServiceRequestWorkRepository(
    validateServiceRequestId(requestId),
    normalizedNote,
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
