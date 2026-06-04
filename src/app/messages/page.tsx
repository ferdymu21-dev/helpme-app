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

  tasks: {
    title: string;
  };

  owner: {
    full_name: string;
  };

  helper: {
    full_name: string;
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
          full_name
        ),
        helper:users!conversations_helper_id_fkey (
          full_name
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
          full_name
        ),
        helper:users!conversations_helper_id_fkey (
          full_name
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

    setConversations(merged);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

    loadConversations();
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