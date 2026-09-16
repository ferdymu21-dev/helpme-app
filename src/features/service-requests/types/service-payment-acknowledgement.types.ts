export const ServicePaymentAcknowledgementStatus = {
  CUSTOMER_REPORTED_PAID: "CUSTOMER_REPORTED_PAID",

  PROVIDER_CONFIRMED: "PROVIDER_CONFIRMED",

  PAYMENT_ISSUE: "PAYMENT_ISSUE",
} as const;

export type ServicePaymentAcknowledgementStatusValue =
  (typeof ServicePaymentAcknowledgementStatus)[keyof typeof ServicePaymentAcknowledgementStatus];

export interface ServicePaymentAcknowledgement {
  id: string;

  paymentStepId: string;

  serviceAgreementId: string;

  attemptNo: number;

  status: ServicePaymentAcknowledgementStatusValue;

  customerNote: string | null;

  customerReportedAt: string;

  providerConfirmedAt: string | null;

  issueReportedAt: string | null;

  issueReason: string | null;

  providerNote: string | null;

  createdAt: string;

  updatedAt: string;
}
