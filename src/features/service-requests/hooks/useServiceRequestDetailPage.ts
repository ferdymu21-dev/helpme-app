"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/store/auth.store";

import { ServiceRequestStatus } from "../constants/service-request-status";

import { getServiceRequestDetailService } from "../services/get-service-request-detail.service";

import {
  acceptServiceCompletionService,
  cancelServiceRequestService,
  requestServiceCompletionRevisionService,
} from "../services/service-request-customer-lifecycle.service";

import {
  beginServiceRequestNegotiationService,
  declineServiceRequestService,
  startServiceRequestWorkService,
  submitServiceRequestWorkService,
} from "../services/service-request-provider-lifecycle.service";

import type { ServiceRequestDetail } from "../types/service-request-read.types";

export function useServiceRequestDetailPage(requestId: string) {
  const user = useAuthStore((state) => state.user);

  const [detail, setDetail] = useState<ServiceRequestDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);

  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );

  const [actionPending, setActionPending] = useState(false);

  const [declineOpen, setDeclineOpen] = useState(false);

  const [declineReason, setDeclineReason] = useState("");

  const [cancellationOpen, setCancellationOpen] = useState(false);

  const [cancellationReason, setCancellationReason] = useState("");

  const [submissionNote, setSubmissionNote] = useState("");

  const [revisionOpen, setRevisionOpen] = useState(false);

  const [revisionReason, setRevisionReason] = useState("");

  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = requestVersion.current + 1;

    requestVersion.current = version;

    setLoading(true);

    setLoadErrorMessage(null);

    setNotFound(false);

    try {
      const result = await getServiceRequestDetailService(requestId);

      if (requestVersion.current !== version) {
        return;
      }

      setDetail(result);

      setNotFound(result === null);
    } catch (error) {
      if (requestVersion.current !== version) {
        return;
      }

      console.error("GET SERVICE REQUEST DETAIL ERROR:", error);

      setDetail(null);

      setLoadErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail Permintaan Jasa belum dapat dimuat.",
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

  const isProvider = Boolean(user && detail && user.id === detail.providerId);

  const isCustomer = Boolean(user && detail && user.id === detail.customerId);

  const canBeginNegotiation = Boolean(
    isProvider && detail?.status === ServiceRequestStatus.PENDING_PROVIDER,
  );

  const canStartWork = Boolean(
    isProvider && detail?.status === ServiceRequestStatus.AGREED,
  );

  const canSubmitWork = Boolean(
    isProvider && detail?.status === ServiceRequestStatus.IN_PROGRESS,
  );

  const canRespondToCompletion = Boolean(
    isCustomer &&
      detail?.status === ServiceRequestStatus.SUBMITTED &&
      detail.latestCompletionSubmission?.status === "SUBMITTED",
  );

  const canDecline = Boolean(
    isProvider &&
    (detail?.status === ServiceRequestStatus.PENDING_PROVIDER ||
      detail?.status === ServiceRequestStatus.NEGOTIATING),
  );

  const canCancel = Boolean(
    isCustomer &&
    (detail?.status === ServiceRequestStatus.PENDING_PROVIDER ||
      detail?.status === ServiceRequestStatus.NEGOTIATING),
  );

  async function handleBeginNegotiation() {
    if (actionPending || !detail || !canBeginNegotiation) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await beginServiceRequestNegotiationService(detail.id);

      await load();
    } catch (error) {
      console.error("BEGIN SERVICE REQUEST NEGOTIATION ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan belum dapat masuk ke tahap negosiasi.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleStartWork() {
    if (actionPending || !detail || !canStartWork) {
      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await startServiceRequestWorkService(detail.id);

      await load();
    } catch (error) {
      console.error("START SERVICE REQUEST WORK ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Pekerjaan belum dapat dimulai.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleSubmitWork() {
    if (actionPending || !detail || !canSubmitWork) {
      return;
    }

    const note = submissionNote.trim();

    if (!note) {
      setActionErrorMessage("Catatan hasil pekerjaan wajib diisi.");

      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await submitServiceRequestWorkService(
        detail.id,
        note,
      );

      setSubmissionNote("");

      await load();
    } catch (error) {
      console.error("SUBMIT SERVICE REQUEST WORK ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Hasil pekerjaan belum dapat dikirim.",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function handleAcceptCompletion() {
    if (actionPending || !detail || !canRespondToCompletion) {
      return;
    }

    setActionErrorMessage(null);
    setActionPending(true);

    try {
      await acceptServiceCompletionService(detail.id);

      await load();
    } catch (error) {
      console.error("ACCEPT SERVICE COMPLETION ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Hasil pekerjaan belum dapat diterima.",
      );
    } finally {
      setActionPending(false);
    }
  }

  function handleOpenRevision() {
    if (actionPending || !canRespondToCompletion) {
      return;
    }

    setActionErrorMessage(null);
    setRevisionOpen(true);
  }

  function handleCancelRevision() {
    if (actionPending) {
      return;
    }

    setRevisionOpen(false);
    setRevisionReason("");
    setActionErrorMessage(null);
  }

  async function handleConfirmRevision() {
    if (actionPending || !detail || !canRespondToCompletion) {
      return;
    }

    const reason = revisionReason.trim();

    if (!reason) {
      setActionErrorMessage("Alasan revisi wajib diisi.");
      return;
    }

    setActionErrorMessage(null);
    setActionPending(true);

    try {
      await requestServiceCompletionRevisionService(
        detail.id,
        reason,
      );

      setRevisionOpen(false);
      setRevisionReason("");

      await load();
    } catch (error) {
      console.error(
        "REQUEST SERVICE COMPLETION REVISION ERROR:",
        error,
      );

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan revisi belum dapat dikirim.",
      );
    } finally {
      setActionPending(false);
    }
  }

  function handleOpenDecline() {
    if (actionPending || !canDecline) {
      return;
    }

    setActionErrorMessage(null);

    setDeclineOpen(true);
  }

  function handleCancelDecline() {
    if (actionPending) {
      return;
    }

    setDeclineOpen(false);

    setDeclineReason("");

    setActionErrorMessage(null);
  }

  async function handleConfirmDecline() {
    if (actionPending || !detail || !canDecline) {
      return;
    }

    const reason = declineReason.trim();

    if (!reason) {
      setActionErrorMessage("Alasan penolakan wajib diisi.");

      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await declineServiceRequestService(detail.id, reason);

      setDeclineOpen(false);

      setDeclineReason("");

      await load();
    } catch (error) {
      console.error("DECLINE SERVICE REQUEST ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan Jasa belum dapat ditolak.",
      );
    } finally {
      setActionPending(false);
    }
  }

  function handleOpenCancellation() {
    if (actionPending || !canCancel) {
      return;
    }

    setActionErrorMessage(null);

    setCancellationOpen(true);
  }

  function handleCancelCancellation() {
    if (actionPending) {
      return;
    }

    setCancellationOpen(false);

    setCancellationReason("");

    setActionErrorMessage(null);
  }

  async function handleConfirmCancellation() {
    if (actionPending || !detail || !canCancel) {
      return;
    }

    const reason = cancellationReason.trim();

    if (!reason) {
      setActionErrorMessage("Alasan pembatalan wajib diisi.");

      return;
    }

    setActionErrorMessage(null);

    setActionPending(true);

    try {
      await cancelServiceRequestService(detail.id, reason);

      setCancellationOpen(false);

      setCancellationReason("");

      await load();
    } catch (error) {
      console.error("CANCEL SERVICE REQUEST ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan Jasa belum dapat dibatalkan.",
      );
    } finally {
      setActionPending(false);
    }
  }
  return {
    detail,

    loading,

    notFound,

    loadErrorMessage,

    actionErrorMessage,

    actionPending,

    isProvider,

    isCustomer,

    canBeginNegotiation,

    canStartWork,

    canSubmitWork,

    canRespondToCompletion,

    canDecline,

    canCancel,

    declineOpen,

    cancellationOpen,

    cancellationReason,

    submissionNote,

    revisionOpen,

    revisionReason,

    declineReason,

    refresh: load,

    onBeginNegotiation: handleBeginNegotiation,

    onStartWork: handleStartWork,

    onSubmitWork: handleSubmitWork,

    onSubmissionNoteChange: setSubmissionNote,

    onAcceptCompletion: handleAcceptCompletion,

    onOpenRevision: handleOpenRevision,

    onCancelRevision: handleCancelRevision,

    onConfirmRevision: handleConfirmRevision,

    onRevisionReasonChange: setRevisionReason,

    onOpenDecline: handleOpenDecline,

    onCancelDecline: handleCancelDecline,

    onConfirmDecline: handleConfirmDecline,

    onDeclineReasonChange: setDeclineReason,

    onOpenCancellation: handleOpenCancellation,

    onCancelCancellation: handleCancelCancellation,

    onConfirmCancellation: handleConfirmCancellation,

    onCancellationReasonChange: setCancellationReason,
  };
}
