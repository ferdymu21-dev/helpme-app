export const ServiceAgreementStatus = {
  PROPOSED: "PROPOSED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUPERSEDED: "SUPERSEDED",
} as const;

export type ServiceAgreementStatusValue =
  (typeof ServiceAgreementStatus)[keyof typeof ServiceAgreementStatus];

export const SERVICE_AGREEMENT_STATUSES: readonly ServiceAgreementStatusValue[] =
  Object.values(ServiceAgreementStatus);

export const ServiceAgreementPaymentPlanType = {
  AFTER_COMPLETION: "AFTER_COMPLETION",
  DEPOSIT_FINAL: "DEPOSIT_FINAL",
  MILESTONES: "MILESTONES",
  FULL_UPFRONT: "FULL_UPFRONT",
} as const;

export type ServiceAgreementPaymentPlanTypeValue =
  (typeof ServiceAgreementPaymentPlanType)[keyof typeof ServiceAgreementPaymentPlanType];

export const SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES: readonly ServiceAgreementPaymentPlanTypeValue[] =
  Object.values(ServiceAgreementPaymentPlanType);

export const ServiceAgreementPaymentTriggerType = {
  UPFRONT: "UPFRONT",
  BEFORE_START: "BEFORE_START",
  MILESTONE: "MILESTONE",
  ON_SUBMISSION: "ON_SUBMISSION",
  AFTER_COMPLETION: "AFTER_COMPLETION",
  CUSTOM: "CUSTOM",
} as const;

export type ServiceAgreementPaymentTriggerTypeValue =
  (typeof ServiceAgreementPaymentTriggerType)[keyof typeof ServiceAgreementPaymentTriggerType];

export const SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES: readonly ServiceAgreementPaymentTriggerTypeValue[] =
  Object.values(ServiceAgreementPaymentTriggerType);
