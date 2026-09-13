import {
  SERVICE_REQUEST_STATUSES,
  type ServiceRequestStatusValue,
} from "../constants/service-request-status";

import { getProviderServiceRequestsRepository } from "../repositories/get-provider-service-requests.repository";

import type { ProviderServiceRequestPage } from "../types/service-request-read.types";

interface GetProviderServiceRequestsInput {
  page?: number;

  pageSize?: number;

  status?: ServiceRequestStatusValue | null;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
  maximum: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("Pagination Permintaan Jasa tidak valid.");
  }

  return Math.min(value, maximum);
}

function normalizeStatus(
  value: ServiceRequestStatusValue | null | undefined,
): ServiceRequestStatusValue | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!SERVICE_REQUEST_STATUSES.some((status) => status === value)) {
    throw new Error("Filter status Permintaan Jasa tidak valid.");
  }

  return value;
}

export async function getProviderServiceRequestsService({
  page,
  pageSize,
  status,
}: GetProviderServiceRequestsInput = {}): Promise<ProviderServiceRequestPage> {
  return getProviderServiceRequestsRepository({
    page: normalizePositiveInteger(page, 1, Number.MAX_SAFE_INTEGER),

    pageSize: normalizePositiveInteger(pageSize, 20, 50),

    status: normalizeStatus(status),
  });
}
