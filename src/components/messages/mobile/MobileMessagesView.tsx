"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import { formatMessageTime } from "@/features/messages/utils/format-message-time";

import type { Conversation } from "@/features/messages/types/conversation.types";

interface Props {
  loading: boolean;
  conversations: Conversation[];
  currentUserId: string;
}

interface ConversationGroup {
  key: string;
  conversations: Conversation[];
  latestConversation: Conversation;
  unreadCount: number;
}

function getConversationTimestamp(conversation: Conversation) {
  return new Date(
    conversation.last_message_at || conversation.created_at,
  ).getTime();
}

export default function MobileMessagesView({
  loading,
  conversations,
  currentUserId,
}: Props) {
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =========================
      GROUP BY OTHER USER
  ========================= */

  const groupedMap = new Map<string, ConversationGroup>();

  for (const conversation of conversations) {
    const isCurrentUserOwner = conversation.owner_id === currentUserId;

    const otherUserId = isCurrentUserOwner
      ? conversation.helper_id
      : conversation.owner_id;

    const groupKey = otherUserId || conversation.id;

    const unreadCount = isCurrentUserOwner
      ? conversation.owner_unread_count || 0
      : conversation.helper_unread_count || 0;

    const existingGroup = groupedMap.get(groupKey);

    if (!existingGroup) {
      groupedMap.set(groupKey, {
        key: groupKey,
        conversations: [conversation],
        latestConversation: conversation,
        unreadCount,
      });

      continue;
    }

    existingGroup.conversations.push(conversation);

const currentTimestamp = getConversationTimestamp(conversation);

const latestTimestamp = getConversationTimestamp(
  existingGroup.latestConversation,
);

if (currentTimestamp > latestTimestamp) {
  existingGroup.latestConversation = conversation;
  existingGroup.unreadCount = unreadCount;
}
  }

  const groupedConversations = Array.from(groupedMap.values()).sort(
    (a, b) =>
      getConversationTimestamp(b.latestConversation) -
      getConversationTimestamp(a.latestConversation),
  );

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        pb-32
        lg:hidden
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          px-6
          py-8
        "
      >
        {/* HEADER */}
<div>
  <div className="relative flex h-10 items-center">
    {/* BACK TO HOME */}
    <Link
      href="/home"
      aria-label="Kembali ke halaman utama"
      className="
        relative
        z-10
        inline-flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        bg-white
        text-slate-700
        shadow-sm
        transition
        hover:bg-slate-50
        active:scale-95
      "
    >
      <ArrowLeft
        className="h-5 w-5"
        strokeWidth={2}
      />
    </Link>

    {/* TITLE */}
    <h1
      className="
        pointer-events-none
        absolute
        left-1/2
        -translate-x-1/2
        text-xl
        font-bold
        tracking-tight
        text-slate-900
      "
    >
      Pesan
    </h1>
  </div>

  <p
    className="
      mt-4
      text-center
      text-sm
      text-slate-500
    "
  >
    Percakapan terbaru Anda
  </p>
</div>

        {/* LIST */}
        <div className="mt-4 grid gap-2.5">
          {loading ? (
            <div
              className="
                rounded-3xl
                bg-white
                p-6
                text-sm
                text-slate-500
                shadow-sm
              "
            >
              Memuat pesan...
            </div>
          ) : groupedConversations.length === 0 ? (
            <div
              className="
                rounded-4xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
              "
            >
              <p
                className="text-sm font-semibold text-slate-700">
                Belum ada pesan
              </p>

              <p
                className="mt-1 text-xs leading-5 text-slate-400">
                Percakapan dengan helper atau pemilik task akan muncul di sini.
              </p>
            </div>
          ) : (
            groupedConversations.map((group) => {
              const conversation = group.latestConversation;

              const isCurrentUserOwner =
                conversation.owner_id === currentUserId;

              const otherUser = isCurrentUserOwner
                ? conversation.helper
                : conversation.owner;

              const sessionCount = group.conversations.length;

              const lastMessageTime = formatMessageTime(
                conversation.last_message_at,
                nowTimestamp,
              );

              return (
                <Link
                  key={group.key}
                  href={`/messages/${conversation.id}`}
                  className="
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                      transition
                      active:scale-[0.99]
                    "
                >
                  <div
                    className="
                        flex
                        items-center
                        gap-3.5
                      "
                  >
                    {/* AVATAR */}
                    {otherUser?.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name || "User"}
                        className="
                            h-12
                            w-12
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
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-100
                            text-sm
                            font-bold
                            text-indigo-700
                          "
                      >
                        {otherUser?.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      {/* NAME + TIME + UNREAD */}
                      <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                      >
                        <h2
                          className="
                              min-w-0
                              truncate
                              text-sm
                              font-bold
                              text-slate-900
                            "
                        >
                          {otherUser?.full_name || "User"}
                        </h2>

                        <div
                          className="
                              flex
                              shrink-0
                              items-center
                              gap-2
                            "
                        >
                          {lastMessageTime && (
                            <span
                              className="
                                  whitespace-nowrap
                                  text-[10px]
                                  font-medium
                                  text-slate-400
                                "
                            >
                              {lastMessageTime}
                            </span>
                          )}

                          {group.unreadCount > 0 && (
                            <div
                              className="
                                  flex
                                  h-6
                                  min-w-6
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-indigo-600
                                  px-2
                                  text-[11px]
                                  font-bold
                                  text-white
                                "
                            >
                              {group.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LAST MESSAGE */}
                      <p
                        className="
                            mt-1
                            truncate
                            text-sm
                            text-slate-500
                          "
                      >
                        {conversation.last_message || "Belum ada pesan"}
                      </p>

                      {/* SESSION */}
                      {sessionCount > 1 && (
                        <div className="mt-2">
                          <span
                            className="
                                inline-flex
                                rounded-full
                                bg-indigo-50
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-indigo-600
                              "
                          >
                            {sessionCount} sesi task
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <MobileBottomNavbar />
    </main>
  );
}