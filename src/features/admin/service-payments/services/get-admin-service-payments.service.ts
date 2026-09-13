import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServicePaymentsRepository } from "../repositories/admin-service-payment.repository";

import type {
  AdminServicePaymentAction,
  AdminServicePaymentListResponse,
  AdminServicePaymentStatus,
} from "../types/admin-service-payment.types";

interface GetAdminServicePaymentsInput {
  page: string | null;

  pageSize: string | null;

  status: string | null;

  action: string | null;

  query: string | null;
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  maximum: number,
) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error("INVALID_PAGINATION");
  }

  return parsed;
}

function parseStatus(value: string | null): AdminServicePaymentStatus | null {
  switch (value) {
    case null:
    case "":
      return null;

    case "CREATING":
    case "PENDING":
    case "PAID":
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return value;

    default:
      throw new Error("INVALID_PAYMENT_STATUS");
  }
}

function parseAction(value: string | null): AdminServicePaymentAction | null {
  switch (value) {
    case null:
    case "":
      return null;

    case "INITIAL_PUBLICATION":
    case "EXPIRED_RENEWAL":
    case "EARLY_RENEWAL":
      return value;

    default:
      throw new Error("INVALID_PUBLICATION_ACTION");
  }
}

function parseQuery(value: string | null) {
  if (!value) {
    return null;
  }

  const query = value.trim();

  if (!query) {
    return null;
  }

  if (query.length > 120) {
    throw new Error("PAYMENT_QUERY_TOO_LONG");
  }

  return query;
}

export async function getAdminServicePaymentsService(
  input: GetAdminServicePaymentsInput,
): Promise<AdminServicePaymentListResponse> {
  await requireAdmin();

  const page = parsePositiveInteger(input.page, 1, 100000);

  const pageSize = parsePositiveInteger(input.pageSize, 20, 100);

  const status = parseStatus(input.status);

  const action = parseAction(input.action);

  const query = parseQuery(input.query);

  return getAdminServicePaymentsRepository({
    page,
    pageSize,
    status,
    action,
    query,
  });
}
