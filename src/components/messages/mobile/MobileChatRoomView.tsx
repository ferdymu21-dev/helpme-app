"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft, Send } from "lucide-react";

import { formatChatMessageTime } from "@/features/messages/utils/format-message-time";

import ServiceRequestChatTimeline from "@/features/service-requests/ServiceRequestChatTimeline";

import type { ServiceAgreement } from "@/features/service-requests/types/service-agreement.types";

import ServiceRequestChatContextCard from "@/features/service-requests/ServiceRequestChatContextCard";

import type { ServiceRequestDetail } from "@/features/service-requests/types/service-request-read.types";

interface Message {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

interface Props {
  loading: boolean;

  messages: Message[];

  serviceRequestDetail: ServiceRequestDetail | null;

  serviceAgreements?: ServiceAgreement[];

  currentUserId: string;

  otherUser: {
    full_name: string;
    avatar_url?: string;
  } | null;

  message: string;

  sending: boolean;

  bottomRef: React.RefObject<HTMLDivElement | null>;

  setMessage: (value: string) => void;

  handleSendMessage: () => void;

  canCreateServiceProposal?: boolean;

  onCreateServiceProposal?: () => void;
}

export default function MobileChatRoomView({
  loading,
  messages,
  serviceRequestDetail,
  serviceAgreements = [],
  currentUserId,
  otherUser,
  message,
  sending,
  bottomRef,
  setMessage,
  handleSendMessage,
  canCreateServiceProposal,
  onCreateServiceProposal,
}: Props) {
  const router = useRouter();

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50 lg:hidden">
      {/* HEADER */}
      <div
        className="
  z-20
  shrink-0
  border-b
  border-slate-200/80
  bg-white/95
  backdrop-blur-xl
"
      >
        <div className="px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            {/* BACK */}
            <button
              type="button"
              onClick={() => router.push("/messages")}
              aria-label="Kembali"
              title="Kembali"
              className="
  flex
  h-9
  w-9
  shrink-0
  items-center
  justify-center
  rounded-full
  border
  border-slate-200
  bg-white
  text-slate-600
  transition
  hover:bg-slate-50
  hover:text-slate-900
  active:scale-95
"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>

            {/* AVATAR */}

            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                className="
  h-10
  w-10
  shrink-0
  rounded-full
  border
  border-slate-200
  object-cover
"
              />
            ) : (
              <div
                className="
  flex
  h-10
  w-10
  shrink-0
  items-center
  justify-center
  rounded-full
  bg-indigo-100
  text-sm
  font-black
  text-indigo-700
"
              >
                {otherUser?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {/* INFO */}

            <div className="min-w-0">
              <h1 className="truncate text-sm font-black text-slate-950">
                {otherUser?.full_name || "Loading..."}
              </h1>

              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {serviceRequestDetail ? "Negosiasi jasa" : "Percakapan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        className="
    min-h-0
    flex-1
    overflow-y-auto
    overscroll-contain
    px-4
    py-5
    sm:px-5
  "
      >
        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <p className="text-xs font-medium text-slate-400">
              Memuat percakapan...
            </p>
          </div>
        ) : (
          <div>
            {serviceRequestDetail && (
              <ServiceRequestChatContextCard
                detail={serviceRequestDetail}
                canCreateProposal={canCreateServiceProposal}
                onCreateProposal={onCreateServiceProposal}
              />
            )}

            {serviceRequestDetail ? (
              <ServiceRequestChatTimeline
                messages={messages}
                agreements={serviceAgreements}
                currentUserId={currentUserId}
                requestId={serviceRequestDetail.id}
                variant="mobile"
              />
            ) : (
              <div className="space-y-2">
                {messages.map((item) => {
                  const isMine = item.sender_id === currentUserId;

                  return (
                    <div
                      key={item.id}
                      className={`
            flex
            ${isMine ? "justify-end" : "justify-start"}
          `}
                    >
                      <div
                        className={`
              max-w-[80%]
              rounded-2xl
              px-3
              py-2
              text-[14px]

              ${
                isMine
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }
            `}
                      >
                        <div
                          className="flex items-end gap-2">
                          <p
                            className="min-w-0 whitespace-pre-wrap wrap-break-word leading-5">
                            {item.content}
                          </p>

                          <time
                            dateTime={item.created_at}
                            className={`
                  mb-0.5
                  shrink-0
                  whitespace-nowrap
                  text-[8.5px]
                  leading-none

                  ${isMine ? "text-indigo-200" : "text-slate-400"}
                `}
                          >
                            {formatChatMessageTime(item.created_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        className="
  z-20
  shrink-0
  border-t
  border-slate-200/80
  bg-white/95
  backdrop-blur-xl
"
      >
        <div className="px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="
  h-11
  min-w-0
  flex-1
  rounded-xl
  border
  border-slate-200
  bg-slate-50
  px-4
  text-sm
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:bg-white
  focus:ring-4
  focus:ring-indigo-100
"
            />

            <button
              onClick={handleSendMessage}
              disabled={sending}
              aria-label="Kirim pesan"
              title="Kirim pesan"
              className="
  flex
  h-11
  w-11
  shrink-0
  items-center
  justify-center
  rounded-full
  bg-indigo-600
  text-white
  shadow-sm
  transition
  hover:bg-indigo-700
  active:scale-95
  disabled:cursor-not-allowed
  disabled:opacity-50
"
            >
              <Send className="h-4.5 w-4.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}