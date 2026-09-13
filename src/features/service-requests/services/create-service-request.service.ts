import { createServiceRequestRepository } from "../repositories/create-service-request.repository";

import { validateAndNormalizeServiceRequestCreate } from "../validators/validate-service-request-create";

import type {
  CreateServiceRequestFormValues,
  CreateServiceRequestResult,
} from "../types/service-request.types";

export async function createServiceRequestService(
  listingId: string,
  values: CreateServiceRequestFormValues,
): Promise<CreateServiceRequestResult> {
  const normalizedPayload = validateAndNormalizeServiceRequestCreate(
    listingId,
    values,
  );

  return createServiceRequestRepository(normalizedPayload);
}
