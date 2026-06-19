"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import MobileChatRoomView from "@/components/messages/mobile/MobileChatRoomView";

import DesktopChatRoomView from "@/components/messages/desktop/DesktopChatRoomView";

import { supabase } from "@/lib/supabase/client";

interface Message {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

export default function ChatRoomPage() {
  const params = useParams();

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [otherUser, setOtherUser] =
    useState<any>(null);

  /* =========================
     LOAD USER
  ========================= */

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);

    const { data: conversation } =
      await supabase
        .from("conversations")
        .select(`
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
    `)
        .eq(
          "id",
          params.id as string
        )
        .single();

    if (conversation) {

      const other =
        user.id ===
          conversation.owner_id

          ? conversation.helper

          : conversation.owner;

      setOtherUser(other);
    }
  }

  /* =========================
     LOAD MESSAGES
  ========================= */

  async function loadMessages() {
    try {
      const { data, error } =
        await supabase
          .from("messages")
          .select("*")
          .eq(
            "conversation_id",
            params.id as string
          )
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setMessages(data || []);

      /* =========================
         RESET UNREAD COUNT
      ========================= */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const {
        data: conversation,
      } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", params.id as string)
        .single();

      if (!conversation) return;

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
        .eq("id", params.id as string);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     SEND MESSAGE
  ========================= */

  async function handleSendMessage() {
    if (!message.trim()) return;

    try {
      setSending(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const conversationId =
        params.id as string;

      /* =========================
         INSERT MESSAGE
      ========================= */

      const { error } =
        await supabase
          .from("messages")
          .insert({
            conversation_id:
              conversationId,

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

      if (
        conversationError ||
        !conversation
      ) {
        console.error(
          conversationError
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

          last_message: message,

          last_message_at:
            new Date().toISOString(),

          owner_unread_count:
            isOwner
              ? (
                conversation.owner_unread_count || 0
              )
              : (
                conversation.owner_unread_count || 0
              ) + 1,

          helper_unread_count:
            isOwner
              ? (
                conversation.helper_unread_count || 0
              ) + 1
              : (
                conversation.helper_unread_count || 0
              ),

        })
        .eq("id", conversationId);

      if (updateError) {

        console.error(
          "UPDATE CONVERSATION ERROR:",
          updateError
        );

        alert(
          JSON.stringify(updateError)
        );
      }

      setMessage("");

    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  /* =========================
     REALTIME
  ========================= */

  useEffect(() => {
    loadUser();
    loadMessages();

    const channel =
      supabase.channel(
        `chat-${params.id}`
      );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${params.id}`,
      },
      (payload) => {
        setMessages((prev) => [
          ...prev,
          payload.new as Message,
        ]);
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [params.id]);

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
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
        handleSendMessage={
          handleSendMessage
        }
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
        handleSendMessage={
          handleSendMessage
        }
      />

    </>
  );
}