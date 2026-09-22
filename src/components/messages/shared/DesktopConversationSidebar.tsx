"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { formatMessageTime } from "@/features/messages/utils/format-message-time";

import type { Conversation } from "@/features/messages/types/conversation.types";

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId?: string;
}

interface ConversationGroup {
  conversations: Conversation[];
  latestConversation: Conversation;
  unreadCount: number;
}

function getConversationTimestamp(conversation: Conversation) {
  return new Date(
    conversation.last_message_at || conversation.created_at,
  ).getTime();
}

export default function DesktopConversationSidebar({
  conversations,
  currentUserId,
  activeConversationId,
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
    <aside
      className="
        flex
        h-full
        min-h-0
        w-85
        shrink-0
        flex-col
        border-r
        border-slate-200/80
        bg-white
      "
    >
      {/* HEADER */}
      <div
  className="
    shrink-0
    border-b
    border-slate-200/80
    px-5
    py-5
  "
>
  <p
    className="
      text-[10px]
      font-black
      uppercase
      tracking-[0.14em]
      text-indigo-600
    "
  >
    Kotak Masuk
  </p>

  <h1
    className="
      mt-1
      text-xl
      font-black
      tracking-tight
      text-slate-950
    "
  >
    Pesan
  </h1>

  <p
    className="
      mt-1
      text-xs
      leading-5
      text-slate-500
    "
  >
    Percakapan task dan jasa terbaru Anda.
  </p>
</div>

      {/* SCROLLABLE LIST */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          p-3
        "
      >
        {groupedConversations.length === 0 ? (
          <div
  className="
    flex
    h-full
    min-h-48
    items-start
    justify-center
    pt-8
    text-center
  "
>
  <div
    className="
      w-full
      rounded-2xl
      border
      border-dashed
      border-slate-200
      bg-slate-50/70
      px-5
      py-8
    "
  >
    <p
      className="
        text-sm
        font-bold
        text-slate-700
      "
    >
      Belum ada percakapan
    </p>

    <p
      className="
        mx-auto
        mt-1
        max-w-55
        text-xs
        leading-5
        text-slate-400
      "
    >
      Percakapan task dan jasa akan muncul di sini.
    </p>
  </div>
</div>
        ) : (
          <div className="space-y-1.5">
            {groupedConversations.map((group) => {
              const conversation = group.latestConversation;

              const isCurrentUserOwner =
                conversation.owner_id === currentUserId;

              const otherUser = isCurrentUserOwner
                ? conversation.helper
                : conversation.owner;

              const isActive = group.conversations.some(
                (item) => item.id === activeConversationId,
              );

              const sessionCount = group.conversations.length;

              const lastMessageTime = formatMessageTime(
                conversation.last_message_at,
                nowTimestamp,
              );

              const groupKey = isCurrentUserOwner
                ? conversation.helper_id
                : conversation.owner_id;

              return (
                <Link
                  key={groupKey || conversation.id}
                  href={`/messages/${conversation.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`
  flex
  items-center
  gap-3
  rounded-2xl
  border
  px-3
  py-3
  transition
  duration-150

  ${
    isActive
      ? `
        border-indigo-200
        bg-indigo-50/80
        shadow-sm
      `
      : `
        border-transparent
        bg-white
        hover:border-slate-200
        hover:bg-slate-50
      `
  }
`}
                >
                  {/* AVATAR */}
                  <div className="relative shrink-0">
                    {otherUser?.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name || "User"}
                        className="
                            h-11
                            w-11
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
                            h-11
                            w-11
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

                    {isActive && (
                      <span
                        className="
                            absolute
                            bottom-0
                            right-0
                            h-4
                            w-4
                            rounded-full
                            border-2
                            border-white
                            bg-indigo-600
                          "
                      />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    {/* NAME + TIME + UNREAD */}
                    <div
                      className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                    >
                      <h2
                        className={`
                            min-w-0
                            truncate
                            text-sm
                            font-bold

                            ${isActive ? "text-indigo-700" : "text-slate-900"}
                          `}
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
                            className={`
                                whitespace-nowrap
                                text-[11px]
                                font-medium

                                ${
                                  isActive
                                    ? "text-indigo-500"
                                    : "text-slate-400"
                                }
                              `}
                          >
                            {lastMessageTime}
                          </span>
                        )}

                        {group.unreadCount > 0 && (
                          <div
                            className="
                                flex
                                h-5
                                min-w-5
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-600
                                px-1.5
                                text-[10px]
                                font-black
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
                      className={`
                          mt-0.5
                          truncate
                          text-[11px]
                          leading-4

                          ${
                            isActive
                              ? "font-medium text-indigo-600"
                              : "text-slate-500"
                          }
                        `}
                    >
                      {conversation.last_message || "Belum ada pesan"}
                    </p>

                    {/* TASK / SESSION */}
                    <div
                      className="
                          mt-1
                          flex
                          min-w-0
                          items-center
                          justify-between
                          gap-2
                        "
                    >
                      {conversation.service_request_id ||
                      conversation.tasks?.title ? (
                        <p
                          className="
                              min-w-0
                              truncate
                              text-[10px]
                              font-medium
                              text-slate-400
                            "
                        >
                          {conversation.service_request_id
                            ? "Permintaan Jasa"
                            : conversation.tasks?.title}
                        </p>
                      ) : (
                        <span />
                      )}

                      {sessionCount > 1 && (
                        <span
                          className="
                              shrink-0
                              rounded-md
                              bg-slate-100
                              px-1.5
                              py-0.5
                              text-[9px]
                              font-bold
                              text-slate-500
                            "
                        >
                          {sessionCount} sesi
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
