import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

import DesktopConversationSidebar from "@/components/messages/shared/DesktopConversationSidebar";

import { formatChatMessageTime } from "@/features/messages/utils/format-message-time";

import type { Conversation } from "@/features/messages/types/conversation.types";

import ServiceRequestChatContextCard from "@/features/service-requests/ServiceRequestChatContextCard";

import type { ServiceRequestDetail } from "@/features/service-requests/types/service-request-read.types";

import ServiceRequestChatTimeline from "@/features/service-requests/ServiceRequestChatTimeline";

import type { ServiceAgreement } from "@/features/service-requests/types/service-agreement.types";

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

  conversations: Conversation[];

  conversationId: string;

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

export default function DesktopChatRoomView({
  loading,
  messages,
  serviceRequestDetail,
  serviceAgreements = [],
  conversations,
  conversationId,
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
  return (
    <div className="hidden lg:flex">
      {/* MAIN APP SIDEBAR */}
      <DesktopSidebar />

      {/* MESSAGES AREA */}
      <main
        className="
          ml-70
          flex
          h-screen
          min-h-0
          flex-1
          overflow-hidden
          bg-slate-100/70
        "
      >
        {/* CONVERSATION SIDEBAR */}
        <DesktopConversationSidebar
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={conversationId}
        />

        {/* CHAT */}
        <section
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
          "
        >
          {/* HEADER */}
          <div
            className="
              shrink-0
              border-b
              border-slate-200/80
              bg-white/95
              px-6
              py-3.5
              backdrop-blur-xl
            "
          >
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
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
                  {otherUser?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              {/* USER INFO */}
              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-slate-950
                  "
                >
                  {otherUser?.full_name || "Loading..."}
                </h1>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {serviceRequestDetail ? "Negosiasi jasa" : "Percakapan"}
                </p>
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
              px-6
              py-6
              xl:px-10
            "
          >
            {loading ? (
              <div className="flex h-full min-h-48 items-center justify-center">
                <p className="text-sm font-medium text-slate-400">
                  Memuat percakapan...
                </p>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-5xl">
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
                    variant="desktop"
                  />
                ) : (
                  <div className="space-y-4">
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
              max-w-[65%]
              rounded-3xl
              px-3.5
              py-2
              text-sm
              shadow-sm

              ${
                isMine
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }
            `}
                          >
                            <div
                              className="
                flex
                items-end
                gap-2
              "
                            >
                              <p
                                className="
                  min-w-0
                  whitespace-pre-wrap
                  wrap-break-word
                  leading-6
                "
                              >
                                {item.content}
                              </p>

                              <time
                                dateTime={item.created_at}
                                className={`
                  mb-0.5
                  shrink-0
                  whitespace-nowrap
                  text-[10px]
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
              shrink-0
              border-t
              border-slate-200/80
              bg-white/95
              px-6
              py-4
              backdrop-blur-xl
            "
          >
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !sending) {
                    event.preventDefault();

                    handleSendMessage();
                  }
                }}
                placeholder="Tulis pesan..."
                className="
                  h-14
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
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="
  h-12
  shrink-0
  rounded-xl
  bg-indigo-600
  px-6
  text-sm
  font-bold
  text-white
  shadow-sm
  transition
  hover:bg-indigo-700
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
              >
                {sending ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}