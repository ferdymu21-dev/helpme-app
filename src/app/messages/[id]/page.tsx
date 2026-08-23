"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";

import MobileChatRoomView from "@/components/messages/mobile/MobileChatRoomView";
import DesktopChatRoomView from "@/components/messages/desktop/DesktopChatRoomView";

import { supabase } from "@/lib/supabase/client";

import type { Conversation } from "@/features/messages/types/conversation.types";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export default function ChatRoomPage() {
  const params = useParams();

  const conversationId =
    params.id as string;

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");

  const [
    otherUser,
    setOtherUser,
  ] =
    useState<ChatUser | null>(
      null,
    );

  /* =========================
       SEND MESSAGE
  ========================= */

  async function handleSendMessage() {
    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    try {
      setSending(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      /* =========================
           INSERT MESSAGE
      ========================= */

      const { error } =
        await supabase
          .from("messages")
          .insert({
            conversation_id:
              conversationId,

            sender_id:
              user.id,

            content:
              trimmedMessage,
          });

      if (error) {
        throw error;
      }

      /* =========================
           GET CONVERSATION
      ========================= */

      const {
        data: conversation,
        error:
          conversationError,
      } = await supabase
        .from("conversations")
        .select("*")
        .eq(
          "id",
          conversationId,
        )
        .single();

      if (
        conversationError ||
        !conversation
      ) {
        console.error(
          conversationError,
        );

        return;
      }

      /* =========================
           UPDATE CONVERSATION
      ========================= */

      const isOwner =
        user.id ===
        conversation.owner_id;

      const {
        error: updateError,
      } = await supabase
        .from("conversations")
        .update({
          last_message:
            trimmedMessage,

          last_message_at:
            new Date().toISOString(),

          owner_unread_count:
            isOwner
              ? conversation.owner_unread_count ||
                0
              : (conversation.owner_unread_count ||
                  0) + 1,

          helper_unread_count:
            isOwner
              ? (conversation.helper_unread_count ||
                  0) + 1
              : conversation.helper_unread_count ||
                0,
        })
        .eq(
          "id",
          conversationId,
        );

      if (updateError) {
        console.error(
          "UPDATE CONVERSATION ERROR:",
          updateError,
        );

        alert(
          JSON.stringify(
            updateError,
          ),
        );
      }

      /*
       * Update sidebar langsung
       * setelah kita mengirim pesan.
       *
       * Tidak perlu query ulang.
       */
      setConversations(
        (previous) =>
          previous
            .map(
              (conversation) =>
                conversation.id ===
                conversationId
                  ? {
                      ...conversation,

                      last_message:
                        trimmedMessage,

                      last_message_at:
                        new Date().toISOString(),
                    }
                  : conversation,
            )
            .sort(
              (a, b) =>
                new Date(
                  b.last_message_at ||
                    b.created_at,
                ).getTime() -
                new Date(
                  a.last_message_at ||
                    a.created_at,
                ).getTime(),
            ),
      );

      setMessage("");
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error,
      );
    } finally {
      setSending(false);
    }
  }

  /* =========================
       INITIAL LOAD + REALTIME
  ========================= */

  useEffect(() => {
    let cancelled = false;

    /* =========================
         LOAD CONVERSATIONS
    ========================= */

    async function loadConversations(
      userId: string,
    ) {
      try {
        /* OWNER */
        const {
          data:
            ownerConversations,
          error: ownerError,
        } = await supabase
          .from("conversations")
          .select(
            `
              *,
              owner:users!conversations_owner_id_fkey (
                full_name,
                avatar_url
              ),
              helper:users!conversations_helper_id_fkey (
                full_name,
                avatar_url
              )
            `,
          )
          .eq(
            "owner_id",
            userId,
          );

        if (ownerError) {
          throw ownerError;
        }

        /* HELPER */
        const {
          data:
            helperConversations,
          error: helperError,
        } = await supabase
          .from("conversations")
          .select(
            `
              *,
              owner:users!conversations_owner_id_fkey (
                full_name,
                avatar_url
              ),
              helper:users!conversations_helper_id_fkey (
                full_name,
                avatar_url
              )
            `,
          )
          .eq(
            "helper_id",
            userId,
          );

        if (helperError) {
          throw helperError;
        }

        if (cancelled) {
          return;
        }

        const merged = [
          ...(
            ownerConversations ||
            []
          ),

          ...(
            helperConversations ||
            []
          ),
        ];

        merged.sort(
          (a, b) =>
            new Date(
              b.last_message_at ||
                b.created_at,
            ).getTime() -
            new Date(
              a.last_message_at ||
                a.created_at,
            ).getTime(),
        );

        setConversations(
          merged,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "LOAD CONVERSATIONS ERROR:",
            error,
          );
        }
      }
    }

    /* =========================
         LOAD USER + ROOM
    ========================= */

    async function loadUser() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (
        !user ||
        cancelled
      ) {
        return;
      }

      setCurrentUserId(
        user.id,
      );

      /*
       * Load sidebar conversation
       * untuk Desktop.
       */
      await loadConversations(
        user.id,
      );

      if (cancelled) {
        return;
      }

      /*
       * Load room yang sedang
       * aktif.
       */
      const {
        data: conversation,
        error,
      } = await supabase
        .from("conversations")
        .select(
          `
            *,
            owner:users!conversations_owner_id_fkey (
              id,
              full_name,
              avatar_url
            ),
            helper:users!conversations_helper_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `,
        )
        .eq(
          "id",
          conversationId,
        )
        .single();

      if (error) {
        console.error(
          "LOAD CONVERSATION ERROR:",
          error,
        );

        return;
      }

      if (
        !conversation ||
        cancelled
      ) {
        return;
      }

      const other =
        user.id ===
        conversation.owner_id
          ? conversation.helper
          : conversation.owner;

      if (!other) {
        setOtherUser(null);

        return;
      }

      setOtherUser({
        id: other.id,

        full_name:
          other.full_name ||
          "User",

        avatar_url:
          other.avatar_url ||
          undefined,
      });
    }

    /* =========================
         LOAD MESSAGES
    ========================= */

    async function loadMessages() {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("messages")
          .select("*")
          .eq(
            "conversation_id",
            conversationId,
          )
          .order(
            "created_at",
            {
              ascending: true,
            },
          );

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        setMessages(
          data || [],
        );

        /* =========================
             RESET UNREAD COUNT
        ========================= */

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (
          !user ||
          cancelled
        ) {
          return;
        }

        const {
          data: conversation,
          error:
            conversationError,
        } = await supabase
          .from("conversations")
          .select("*")
          .eq(
            "id",
            conversationId,
          )
          .single();

        if (
          conversationError ||
          !conversation ||
          cancelled
        ) {
          return;
        }

        const isOwner =
          user.id ===
          conversation.owner_id;

        await supabase
          .from("conversations")
          .update({
            owner_unread_count:
              isOwner
                ? 0
                : conversation.owner_unread_count,

            helper_unread_count:
              isOwner
                ? conversation.helper_unread_count
                : 0,
          })
          .eq(
            "id",
            conversationId,
          );

        /*
         * Badge unread room aktif
         * langsung dibuat 0
         * di sidebar lokal.
         */
        if (!cancelled) {
          setConversations(
            (previous) =>
              previous.map(
                (item) => {
                  if (
                    item.id !==
                    conversationId
                  ) {
                    return item;
                  }

                  return {
                    ...item,

                    owner_unread_count:
                      isOwner
                        ? 0
                        : item.owner_unread_count,

                    helper_unread_count:
                      isOwner
                        ? item.helper_unread_count
                        : 0,
                  };
                },
              ),
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "LOAD MESSAGES ERROR:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    /* =========================
         REALTIME CHANNEL
    ========================= */

    const channel =
      supabase.channel(
        `chat-${conversationId}`,
      );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter:
          `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (cancelled) {
          return;
        }

        const newMessage =
          payload.new as Message;

        setMessages(
          (previous) => [
            ...previous,
            newMessage,
          ],
        );

        /*
         * Update preview sidebar
         * tanpa membuat realtime
         * subscription kedua.
         */
        setConversations(
          (previous) =>
            previous
              .map(
                (conversation) =>
                  conversation.id ===
                  conversationId
                    ? {
                        ...conversation,

                        last_message:
                          newMessage.content,

                        last_message_at:
                          newMessage.created_at,
                      }
                    : conversation,
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.last_message_at ||
                      b.created_at,
                  ).getTime() -
                  new Date(
                    a.last_message_at ||
                      a.created_at,
                  ).getTime(),
              ),
        );
      },
    );

    void channel.subscribe();

    /* =========================
         INITIAL LOAD
    ========================= */

    void (async () => {
      if (cancelled) {
        return;
      }

      await loadUser();

      if (cancelled) {
        return;
      }

      await loadMessages();
    })();

    /* =========================
         CLEANUP
    ========================= */

    return () => {
      cancelled = true;

      void supabase.removeChannel(
        channel,
      );
    };
  }, [conversationId]);

  /* =========================
       AUTO SCROLL
  ========================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      },
    );
  }, [messages]);

  return (
    <>
      {/* MOBILE */}
      <MobileChatRoomView
        loading={loading}
        messages={messages}
        currentUserId={
          currentUserId
        }
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={
          handleSendMessage
        }
      />

      {/* DESKTOP */}
      <DesktopChatRoomView
        loading={loading}
        messages={messages}
        conversations={
          conversations
        }
        conversationId={
          conversationId
        }
        currentUserId={
          currentUserId
        }
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={
          handleSendMessage
        }
      />
    </>
  );
}