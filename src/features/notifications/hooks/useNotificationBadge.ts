"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { subscribeNotifications } from "../realtime";

export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUnreadCount(0);

        return;
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      setUnreadCount(count ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  void Promise.resolve().then(() => loadUnreadCount());

  (async () => {
    unsubscribe = await subscribeNotifications(loadUnreadCount);
  })();

  return () => {
    unsubscribe?.();
  };
}, [loadUnreadCount]);

  return {
    unreadCount,

    hasUnread: unreadCount > 0,

    loading,

    reload: loadUnreadCount,
  };
}