"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import MobileMessagesView from "@/components/messages/mobile/MobileMessagesView";

import DesktopMessagesView from "@/components/messages/desktop/DesktopMessagesView";

import { supabase } from "@/lib/supabase/client";

interface Conversation {
  id: string;

  task_id: string;

  owner_id: string;

  helper_id: string;

  created_at: string;

  last_message: string;

  last_message_at: string;

  owner_unread_count: number;

  helper_unread_count: number;

  tasks: {
    title: string;
  };

  owner: {
    full_name: string;
    avatar_url?: string;
  };

  helper: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function MessagesPage() {
  const [loading, setLoading] =
    useState(true);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState("");

  useEffect(() => {

  async function loadConversations() {

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUserId(user.id);

      /* =========================
         OWNER CONVERSATIONS
      ========================= */

      const {
        data: ownerConversations,
        error: ownerError,
      } = await supabase
        .from("conversations")
        .select(`
          *,
          owner:users!conversations_owner_id_fkey (
            full_name,
            avatar_url
          ),
          helper:users!conversations_helper_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("owner_id", user.id);

      if (ownerError) {
        throw ownerError;
      }

      /* =========================
         HELPER CONVERSATIONS
      ========================= */

      const {
        data: helperConversations,
        error: helperError,
      } = await supabase
        .from("conversations")
        .select(`
          *,
          owner:users!conversations_owner_id_fkey (
            full_name,
            avatar_url
          ),
          helper:users!conversations_helper_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("helper_id", user.id);

      if (helperError) {
        throw helperError;
      }

      /* =========================
         MERGE
      ========================= */

      const merged = [
        ...(ownerConversations || []),
        ...(helperConversations || []),
      ];

      /* =========================
         SORT NEWEST CHAT
      ========================= */

      merged.sort((a, b) => {

        return (
          new Date(
            b.last_message_at ||
            b.created_at
          ).getTime()

          -

          new Date(
            a.last_message_at ||
            a.created_at
          ).getTime()
        );
      });

      setConversations(merged);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  loadConversations();

  /* =========================
     REALTIME CONVERSATIONS
  ========================= */

  const channel =
    supabase.channel(
      "messages-page-realtime"
    );

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    () => {
      loadConversations();
    }
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(
      channel
    );
  };

}, []);

  return (
  <>
    <MobileMessagesView
      loading={loading}
      conversations={conversations}
      currentUserId={currentUserId}
    />

    <DesktopMessagesView
      conversations={conversations}
      currentUserId={currentUserId}
    />
  </>
);
}