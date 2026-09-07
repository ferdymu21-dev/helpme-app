"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

import { subscribeNotifications } from "../realtime";

export function useNotificationBadge() {
  const userId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const loadUnreadCount =
    useCallback(async () => {
      if (!userId) {
        setUnreadCount(0);

        setLoading(false);

        return;
      }

      try {
        const {
          count,
          error,
        } = await supabase
          .from("notifications")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "is_read",
            false,
          );

        if (error) {
          throw error;
        }

        setUnreadCount(
          count ?? 0,
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, [userId]);

  useEffect(() => {
    let cancelled = false;

    let unsubscribe:
      | (() => void)
      | undefined;

    /*
     * Initial unread load.
     */
    void Promise.resolve().then(
      async () => {
        if (cancelled) {
          return;
        }

        await loadUnreadCount();
      },
    );

    /*
     * Subscription menggunakan userId
     * dari AuthProvider/Zustand.
     *
     * Kalau component sudah unmount saat
     * subscription selesai dibuat,
     * cleanup langsung dijalankan.
     */
    void subscribeNotifications(
      loadUnreadCount,
      userId,
    )
      .then((cleanup) => {
        if (cancelled) {
          cleanup();

          return;
        }

        unsubscribe = cleanup;
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(error);
        }
      });

    return () => {
      cancelled = true;

      unsubscribe?.();
    };
  }, [
    loadUnreadCount,
    userId,
  ]);

  return {
    unreadCount,

    hasUnread:
      unreadCount > 0,

    loading,

    reload:
      loadUnreadCount,
  };
}