"use client";

import { useState } from "react";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { ServiceRequestStatus } from "./constants/service-request-status";

import { ensureServiceRequestConversationService } from "./services/service-request-chat.service";

import type { ServiceRequestDetail } from "./types/service-request-read.types";

interface ServiceRequestChatActionProps {
  requestId: string;

  requestStatus: ServiceRequestDetail["status"];

  isProvider: boolean;

  isCustomer: boolean;
}

function isServiceRequestChatActive(
  status: ServiceRequestDetail["status"],
): boolean {
  return (
    status === ServiceRequestStatus.NEGOTIATING ||
    status === ServiceRequestStatus.AGREEMENT_PENDING ||
    status === ServiceRequestStatus.AGREED ||
    status === ServiceRequestStatus.IN_PROGRESS ||
    status === ServiceRequestStatus.SUBMITTED
  );
}

export default function ServiceRequestChatAction({
  requestId,
  requestStatus,
  isProvider,
  isCustomer,
}: ServiceRequestChatActionProps) {
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isParticipant = isProvider || isCustomer;

  const canOpenChat =
    isParticipant && isServiceRequestChatActive(requestStatus);

  if (!canOpenChat) {
    return null;
  }

  async function handleOpenChat() {
    if (pending) {
      return;
    }

    setPending(true);

    setErrorMessage(null);

    try {
      const conversationId =
        await ensureServiceRequestConversationService(requestId);

      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error("OPEN SERVICE REQUEST CHAT ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Chat Permintaan Jasa belum dapat dibuka.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">Chat Permintaan</h2>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Gunakan chat untuk berkomunikasi dengan pihak lain selama proses
        Permintaan Jasa berlangsung.
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenChat}
        disabled={pending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MessageCircle size={17} />

        {pending ? "Membuka Chat..." : "Buka Chat"}
      </button>
    </section>
  );
}
