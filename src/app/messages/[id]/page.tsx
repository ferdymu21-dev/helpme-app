"use client";

import { useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";

import MobileChatRoomView from "@/components/messages/mobile/MobileChatRoomView";
import DesktopChatRoomView from "@/components/messages/desktop/DesktopChatRoomView";

import { supabase } from "@/lib/supabase/client";

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

  const conversationId = params.id as string;

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");

  const [otherUser, setOtherUser] =
    useState<ChatUser | null>(null);

  /* =========================
       SEND MESSAGE
    ========================= */

  async function handleSendMessage() {
    if (!message.trim()) {
      return;
    }

    try {
      setSending(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      /* =========================
             INSERT MESSAGE
          ========================= */

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message,
        });

      if (error) {
        throw error;
      }

      /* =========================
             GET CONVERSATION
          ========================= */

      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (conversationError || !conversation) {
        console.error(conversationError);

        return;
      }

      /* =========================
             UPDATE CONVERSATION
          ========================= */

      const isOwner =
        user.id === conversation.owner_id;

      const { error: updateError } =
        await supabase
          .from("conversations")
          .update({
            last_message: message,

            last_message_at:
              new Date().toISOString(),

            owner_unread_count: isOwner
              ? conversation.owner_unread_count || 0
              : (conversation.owner_unread_count ||
                  0) + 1,

            helper_unread_count: isOwner
              ? (conversation.helper_unread_count ||
                  0) + 1
              : conversation.helper_unread_count ||
                0,
          })
          .eq("id", conversationId);

      if (updateError) {
        console.error(
          "UPDATE CONVERSATION ERROR:",
          updateError,
        );

        alert(JSON.stringify(updateError));
      }

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
         LOAD USER + CONVERSATION
      ========================= */

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      setCurrentUserId(user.id);

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
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error(
          "LOAD CONVERSATION ERROR:",
          error,
        );

        return;
      }

      if (!conversation || cancelled) {
        return;
      }

      const other =
        user.id === conversation.owner_id
          ? conversation.helper
          : conversation.owner;

      if (!other) {
        setOtherUser(null);
        return;
      }

      setOtherUser({
        id: other.id,
        full_name:
          other.full_name || "User",
        avatar_url:
          other.avatar_url || undefined,
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
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        setMessages(data || []);

        /* =========================
             RESET UNREAD COUNT
          ========================= */

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        const {
          data: conversation,
          error: conversationError,
        } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (
          conversationError ||
          !conversation ||
          cancelled
        ) {
          return;
        }

        const isOwner =
          user.id === conversation.owner_id;

        await supabase
          .from("conversations")
          .update({
            owner_unread_count: isOwner
              ? 0
              : conversation.owner_unread_count,

            helper_unread_count: isOwner
              ? conversation.helper_unread_count
              : 0,
          })
          .eq("id", conversationId);
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

    const channel = supabase.channel(
      `chat-${conversationId}`,
    );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (cancelled) {
          return;
        }

        setMessages((prev) => [
          ...prev,
          payload.new as Message,
        ]);
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

      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /* =========================
       AUTO SCROLL
    ========================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      <MobileChatRoomView
        loading={loading}
        messages={messages}
        currentUserId={currentUserId}
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
      />

      <DesktopChatRoomView
        loading={loading}
        messages={messages}
        currentUserId={currentUserId}
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
      />
    </>
  );
}