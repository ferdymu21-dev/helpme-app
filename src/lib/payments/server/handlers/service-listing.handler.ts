import type {
  PaymentStatusValue,
} from "../../constants/payment";

import {
  applyServiceListingPaymentStatus,
} from "@/features/service-listings/repositories/service-listing-publication.server.repository";

interface ServiceListingHandlerPayload {
  orderId: string;

  paymentStatus:
    PaymentStatusValue;

  transactionId?:
    string;

  paymentMethod?:
    string;

  paidAt?:
    string;

  expiredAt?:
    string;
}

export async function handleServiceListingPayment(
  payload: ServiceListingHandlerPayload,
) {
  await applyServiceListingPaymentStatus({
    orderId:
      payload.orderId,

    paymentStatus:
      payload.paymentStatus,

    transactionId:
      payload.transactionId,

    paymentMethod:
      payload.paymentMethod,

    paidAt:
      payload.paidAt,

    expiredAt:
      payload.expiredAt,
  });
}