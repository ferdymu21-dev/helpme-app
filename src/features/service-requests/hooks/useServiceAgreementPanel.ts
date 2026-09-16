"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ServiceAgreementPaymentPlanType,
  ServiceAgreementPaymentTriggerType,
  ServiceAgreementStatus,
  type ServiceAgreementPaymentPlanTypeValue,
  type ServiceAgreementPaymentTriggerTypeValue,
} from "../constants/service-agreement";

import {
  ServiceRequestStatus,
  type ServiceRequestStatusValue,
} from "../constants/service-request-status";

import { getServiceRequestAgreementsService } from "../services/get-service-request-agreements.service";

import {
  confirmServicePaymentService,
  getServicePaymentAcknowledgementsService,
  reportServicePaymentIssueService,
  reportServicePaymentPaidService,
} from "../services/service-payment-acknowledgement.service";

import {
  approveServiceAgreementService,
  proposeServiceAgreementService,
  rejectServiceAgreementService,
} from "../services/service-agreement-lifecycle.service";

import type {
  ServiceAgreement,
  ServiceAgreementProposalDraft,
} from "../types/service-agreement.types";

import type { ServicePaymentAcknowledgement } from "../types/service-payment-acknowledgement.types";

interface UseServiceAgreementPanelInput {
  requestId: string;

  requestStatus: ServiceRequestStatusValue;

  isProvider: boolean;

  isCustomer: boolean;

  onRequestChanged: () => void | Promise<void>;
}

type ProposalTextField =
  | "scope"
  | "deliverables"
  | "totalPrice"
  | "deadline"
  | "revisionTerms"
  | "notes";

type PaymentStepTextField = "label" | "amount" | "triggerNote";

function createInitialProposalDraft(
  requestId: string,
): ServiceAgreementProposalDraft {
  return {
    requestId,

    scope: "",

    deliverables: "",

    totalPrice: "",

    deadline: "",

    revisionTerms: "",

    paymentPlanType: ServiceAgreementPaymentPlanType.AFTER_COMPLETION,

    paymentSteps: [
      {
        label: "Pembayaran setelah pekerjaan selesai",

        amount: "",

        triggerType: ServiceAgreementPaymentTriggerType.AFTER_COMPLETION,

        triggerNote: "",
      },
    ],

    notes: "",
  };
}

export function useServiceAgreementPanel({
  requestId,
  requestStatus,
  isProvider,
  isCustomer,
  onRequestChanged,
}: UseServiceAgreementPanelInput) {
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);

  const [
    paymentAcknowledgements,
    setPaymentAcknowledgements,
  ] = useState<ServicePaymentAcknowledgement[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );

  const [actionPending, setActionPending] = useState(false);

  const [proposalOpen, setProposalOpen] = useState(false);

  const [proposalDraft, setProposalDraft] =
    useState<ServiceAgreementProposalDraft>(() =>
      createInitialProposalDraft(requestId),
    );

  const [rejectionOpen, setRejectionOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  const [
    paymentIssueAcknowledgementId,
    setPaymentIssueAcknowledgementId,
  ] = useState<string | null>(null);

  const [
    paymentIssueReason,
    setPaymentIssueReason,
  ] = useState("");

  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = requestVersion.current + 1;

    requestVersion.current = version;

    setLoading(true);

    setLoadErrorMessage(null);

    try {
      const [
        agreementResult,
        paymentAcknowledgementResult,
      ] = await Promise.all([
        getServiceRequestAgreementsService(
          requestId,
        ),
        getServicePaymentAcknowledgementsService(
          requestId,
        ),
      ]);

      if (requestVersion.current !== version) {
        return;
      }

      setAgreements(
        agreementResult,
      );

      setPaymentAcknowledgements(
        paymentAcknowledgementResult,
      );
    } catch (error) {
      if (requestVersion.current !== version) {
        return;
      }

      console.error("GET SERVICE AGREEMENTS ERROR:", error);

      setLoadErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail kesepakatan dan pembayaran belum dapat dimuat.",
      );
    } finally {
      if (requestVersion.current === version) {
        setLoading(false);
      }
    }
  }, [requestId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);

      requestVersion.current += 1;
    };
  }, [load]);

  const latestAgreement = agreements[0] ?? null;

  const canPropose = Boolean(
    isProvider && requestStatus === ServiceRequestStatus.NEGOTIATING,
  );

  const canCustomerRespond = Boolean(
    isCustomer &&
    requestStatus === ServiceRequestStatus.AGREEMENT_PENDING &&
    latestAgreement?.status === ServiceAgreementStatus.PROPOSED,
  );

  function handleOpenProposal() {
    if (actionPending || !canPropose) {
      return;
    }

    setActionErrorMessage(null);

    setProposalDraft(createInitialProposalDraft(requestId));

    setProposalOpen(true);
  }

  function handleCancelProposal() {
    if (actionPending) {
      return;
    }

    setProposalOpen(false);

    setActionErrorMessage(null);
  }

  function handleProposalFieldChange(field: ProposalTextField, value: string) {
    setProposalDraft((current) => ({
      ...current,

      [field]: value,
    }));
  }

  function handlePaymentPlanTypeChange(
    value: ServiceAgreementPaymentPlanTypeValue,
  ) {
    setProposalDraft((current) => ({
      ...current,

      paymentPlanType: value,
    }));
  }

  function handlePaymentStepFieldChange(
    index: number,
    field: PaymentStepTextField,
    value: string,
  ) {
    setProposalDraft((current) => ({
      ...current,

      paymentSteps: current.paymentSteps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,

              [field]: value,
            }
          : step,
      ),
    }));
  }

  function handlePaymentStepTriggerChange(
    index: number,
    value: ServiceAgreementPaymentTriggerTypeValue,
  ) {
    setProposalDraft((current) => ({
      ...current,

      paymentSteps: current.paymentSteps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,

              triggerType: value,
            }
          : step,
      ),
    }));
  }

  function handleAddPaymentStep() {
    setProposalDraft((current) => ({
      ...current,

      paymentSteps: [
        ...current.paymentSteps,
        {
          label: `Tahap ${current.paymentSteps.length + 1}`,

          amount: "",

          triggerType: ServiceAgreementPaymentTriggerType.MILESTONE,

          triggerNote: "",
        },
      ],
    }));
  }

  function handleRemovePaymentStep(index: number) {
    setProposalDraft((current) => {
      if (current.paymentSteps.length <= 1) {
        return current;
      }

      return {
        ...current,

        paymentSteps: current.paymentSteps.filter(
          (_step, stepIndex) => stepIndex !== index,
        ),
      };
    });
  }

  async function refreshRequestAndAgreements() {
    await onRequestChanged();

    await load();
  }

  async function handleSubmitProposal() {
    if (actionPending || !canPropose) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await proposeServiceAgreementService({
        ...proposalDraft,

        requestId,
      });

      setProposalOpen(false);

      setProposalDraft(createInitialProposalDraft(requestId));

      await refreshRequestAndAgreements();
    } catch (error) {
      console.error("PROPOSE SERVICE AGREEMENT ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Proposal kesepakatan belum dapat dikirim.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleApproveAgreement() {
    if (actionPending || !canCustomerRespond || !latestAgreement) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await approveServiceAgreementService(latestAgreement.id);

      await refreshRequestAndAgreements();
    } catch (error) {
      console.error("APPROVE SERVICE AGREEMENT ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Kesepakatan belum dapat disetujui.",
      );
    } finally {
      setActionPending(false);
    }
  }

  function handleOpenRejection() {
    if (actionPending || !canCustomerRespond) {
      return;
    }

    setActionErrorMessage(null);

    setRejectionOpen(true);
  }

  function handleCancelRejection() {
    if (actionPending) {
      return;
    }

    setRejectionOpen(false);

    setRejectionReason("");

    setActionErrorMessage(null);
  }

  async function handleRejectAgreement() {
    if (actionPending || !canCustomerRespond || !latestAgreement) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionErrorMessage("Alasan penolakan kesepakatan wajib diisi.");

      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await rejectServiceAgreementService(latestAgreement.id, reason);

      setRejectionOpen(false);

      setRejectionReason("");

      await refreshRequestAndAgreements();
    } catch (error) {
      console.error("REJECT SERVICE AGREEMENT ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Kesepakatan belum dapat ditolak.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleReportPaymentPaid(
    paymentStepId: string,
  ) {
    if (
      actionPending ||
      !isCustomer
    ) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await reportServicePaymentPaidService(
        paymentStepId,
        "",
      );

      setPaymentIssueAcknowledgementId(null);

      setPaymentIssueReason("");

      await load();
    } catch (error) {
      console.error(
        "REPORT SERVICE PAYMENT PAID ERROR:",
        error,
      );

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Pembayaran belum dapat dilaporkan.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleConfirmPayment(
    acknowledgementId: string,
  ) {
    if (
      actionPending ||
      !isProvider
    ) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await confirmServicePaymentService(
        acknowledgementId,
        "",
      );

      setPaymentIssueAcknowledgementId(null);

      setPaymentIssueReason("");

      await load();
    } catch (error) {
      console.error(
        "CONFIRM SERVICE PAYMENT ERROR:",
        error,
      );

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Pembayaran belum dapat dikonfirmasi.",
      );
    } finally {
      setActionPending(false);
    }
  }

  function handleOpenPaymentIssue(
    acknowledgementId: string,
  ) {
    if (
      actionPending ||
      !isProvider
    ) {
      return;
    }

    setActionErrorMessage(null);

    setPaymentIssueAcknowledgementId(
      acknowledgementId,
    );

    setPaymentIssueReason("");
  }

  function handleCancelPaymentIssue() {
    if (actionPending) {
      return;
    }

    setPaymentIssueAcknowledgementId(null);

    setPaymentIssueReason("");

    setActionErrorMessage(null);
  }

  async function handleReportPaymentIssue() {
    if (
      actionPending ||
      !isProvider ||
      !paymentIssueAcknowledgementId
    ) {
      return;
    }

    const reason =
      paymentIssueReason.trim();

    if (!reason) {
      setActionErrorMessage(
        "Alasan masalah pembayaran wajib diisi.",
      );

      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await reportServicePaymentIssueService(
        paymentIssueAcknowledgementId,
        reason,
        "",
      );

      setPaymentIssueAcknowledgementId(null);

      setPaymentIssueReason("");

      await load();
    } catch (error) {
      console.error(
        "REPORT SERVICE PAYMENT ISSUE ERROR:",
        error,
      );

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Masalah pembayaran belum dapat dilaporkan.",
      );
    } finally {
      setActionPending(false);
    }
  }

  return {
    agreements,

    paymentAcknowledgements,

    latestAgreement,

    loading,

    loadErrorMessage,

    actionErrorMessage,

    actionPending,

    canPropose,

    canCustomerRespond,

    proposalOpen,

    proposalDraft,

    rejectionOpen,

    rejectionReason,

    paymentIssueAcknowledgementId,

    paymentIssueReason,

    refresh: load,

    onOpenProposal: handleOpenProposal,

    onCancelProposal: handleCancelProposal,

    onProposalFieldChange: handleProposalFieldChange,

    onPaymentPlanTypeChange: handlePaymentPlanTypeChange,

    onPaymentStepFieldChange: handlePaymentStepFieldChange,

    onPaymentStepTriggerChange: handlePaymentStepTriggerChange,

    onAddPaymentStep: handleAddPaymentStep,

    onRemovePaymentStep: handleRemovePaymentStep,

    onSubmitProposal: handleSubmitProposal,

    onApproveAgreement: handleApproveAgreement,

    onOpenRejection: handleOpenRejection,

    onCancelRejection: handleCancelRejection,

    onRejectAgreement: handleRejectAgreement,

    onReportPaymentPaid:
      handleReportPaymentPaid,

    onConfirmPayment:
      handleConfirmPayment,

    onOpenPaymentIssue:
      handleOpenPaymentIssue,

    onCancelPaymentIssue:
      handleCancelPaymentIssue,

    onPaymentIssueReasonChange:
      setPaymentIssueReason,

    onReportPaymentIssue:
      handleReportPaymentIssue,

    onRejectionReasonChange: setRejectionReason,
  };
}
