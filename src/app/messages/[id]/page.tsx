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

  /* =========================
     LOAD USER
  ========================= */

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);
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

      const { error } =
        await supabase
          .from("messages")
          .insert({
            conversation_id:
              params.id as string,

            sender_id: user.id,

            content: message,
          });

      if (error) {
        throw error;
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