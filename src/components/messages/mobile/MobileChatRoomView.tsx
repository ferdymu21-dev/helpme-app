"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft, Send } from "lucide-react";

import { formatChatMessageTime } from "@/features/messages/utils/format-message-time";

interface Message {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

interface Props {
  loading: boolean;

  messages: Message[];

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
}

export default function MobileChatRoomView({
  loading,
  messages,
  currentUserId,
  otherUser,
  message,
  sending,
  bottomRef,
  setMessage,
  handleSendMessage,
}: Props) {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 lg:hidden">
      {/* HEADER */}
      <div
        className="
          sticky
          top-0
          z-20
          border-b
          border-slate-200
          bg-white/90
          backdrop-blur
        "
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            {/* BACK */}
            <button
              type="button"
              onClick={() => router.push("/messages")}
              aria-label="Kembali"
              title="Kembali"
              className="
      flex
      h-10
      w-10
      shrink-0
      items-center
      justify-center
      rounded-full
      text-slate-700
      transition
      hover:bg-slate-100
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
          h-11
          w-11
          rounded-full
          object-cover
          border
          border-slate-200
        "
              />
            ) : (
              <div
                className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          bg-indigo-100
          text-sm
          font-bold
          text-indigo-700
        "
              >
                {otherUser?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {/* INFO */}

            <div>
              <h1
                className="text-base font-bold text-slate-900">
                {otherUser?.full_name || "Loading..."}
              </h1>

              <p
                className="text-xs text-slate-500">
                Percakapan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 px-6 py-8">
        {loading ? (
          <div>Memuat pesan...</div>
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

                      {/* MESSAGE */}
                      <p
                        className="min-w-0 whitespace-pre-wrap wrap-break-word leading-5">
                        {item.content}
                      </p>

                      {/* TIME */}
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

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        className="
          sticky
          bottom-0
          border-t
          border-slate-200
          bg-white
        "
      >
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="
    h-12
    flex-1
    rounded-2xl
    border
    border-slate-200
    bg-slate-50
    px-4
    text-sm
    outline-none
  "
            />

            <button
              onClick={handleSendMessage}
              disabled={sending}
              aria-label="Kirim pesan"
              title="Kirim pesan"
              className="
    flex
    h-12
    w-12
    shrink-0
    items-center
    justify-center
    rounded-full
    bg-indigo-600
    text-white
    transition
    hover:bg-indigo-700
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
            >
              <Send className="h-5 w-5" strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}