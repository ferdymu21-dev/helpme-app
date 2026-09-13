import type {
  ServiceAgreementPaymentPlanTypeValue,
  ServiceAgreementPaymentTriggerTypeValue,
  ServiceAgreementStatusValue,
} from "../constants/service-agreement";

export interface ServiceAgreementPaymentStep {
  id: string;

  sequenceNo: number;

  label: string;

  amount: number;

  triggerType: ServiceAgreementPaymentTriggerTypeValue;

  triggerNote: string | null;

  createdAt: string;
}

export interface ServiceAgreement {
  id: string;

  serviceRequestId: string;

  version: number;

  supersedesAgreementId: string | null;

  scope: string;

  deliverables: string;

  totalPrice: number;

  priorConfirmedAmount: number;

  deadline: string;

  revisionTerms: string;

  paymentPlanType: ServiceAgreementPaymentPlanTypeValue;

  notes: string | null;

  status: ServiceAgreementStatusValue;

  proposedBy: string;

  approvedAt: string | null;

  rejectedAt: string | null;

  rejectionReason: string | null;

  supersededAt: string | null;

  createdAt: string;

  paymentSteps: ServiceAgreementPaymentStep[];
}

export interface ServiceAgreementPaymentStepDraft {
  label: string;

  amount: string;

  triggerType: ServiceAgreementPaymentTriggerTypeValue;

  triggerNote: string;
}

export interface ServiceAgreementProposalDraft {
  requestId: string;

  scope: string;

  deliverables: string;

  totalPrice: string;

  deadline: string;

  revisionTerms: string;

  paymentPlanType: ServiceAgreementPaymentPlanTypeValue;

  paymentSteps: ServiceAgreementPaymentStepDraft[];

  notes: string;
}

export interface ServiceAgreementPaymentStepInput {
  label: string;

  amount: number;

  triggerType: ServiceAgreementPaymentTriggerTypeValue;

  triggerNote: string | null;
}

export interface ProposeServiceAgreementInput {
  requestId: string;

  scope: string;

  deliverables: string;

  totalPrice: number;

  deadline: string;

  revisionTerms: string;

  paymentPlanType: ServiceAgreementPaymentPlanTypeValue;

  paymentSteps: ServiceAgreementPaymentStepInput[];

  notes: string | null;
}
