import { supabase } from "@/lib/supabase/client";

import type { Notification } from "../types/notification.types";

const PAGE_SIZE = 5;

export interface NotificationPage {
  notifications: Notification[];

  hasMore: boolean;

  nextCursor: string | null;
}

/* =========================
   GET MY NOTIFICATIONS
========================= */

export async function getMyNotifications(
  cursor?: string | null,
): Promise<NotificationPage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User belum login");
  }

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const {
    data,

    error,
  } = await query;

  if (error) {
    throw error;
  }

  const rows = data ?? [];

  const hasMore = rows.length > PAGE_SIZE;

  const notifications = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  const nextCursor = hasMore
    ? notifications[notifications.length - 1].created_at
    : null;

  return {
    notifications,

    hasMore,

    nextCursor,
  };
}