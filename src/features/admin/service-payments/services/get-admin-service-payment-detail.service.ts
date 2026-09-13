import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminServicePaymentDetailRepository } from "../repositories/admin-service-payment.repository";

import type { AdminServicePayment } from "../types/admin-service-payment.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdminServicePaymentDetailService(
  paymentId: string,
): Promise<AdminServicePayment> {
  await requireAdmin();

  if (!UUID_PATTERN.test(paymentId)) {
    throw new Error("INVALID_PAYMENT_ID");
  }

  const payment = await getAdminServicePaymentDetailRepository(paymentId);

  if (!payment) {
    throw new Error("SERVICE_PAYMENT_NOT_FOUND");
  }

  return payment;
}
