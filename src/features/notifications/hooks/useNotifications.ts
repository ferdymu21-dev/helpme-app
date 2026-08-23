"use client";

import { useCallback, useEffect, useState } from "react";

import { subscribeNotifications } from "../realtime";

import type { Notification } from "../types/notification.types";

import { markNotificationReadAction } from "../actions/client";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
} from "../services";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const [hasMore, setHasMore] = useState(false);

  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await getMyNotifications();

      setNotifications(result.notifications);

      setHasMore(result.hasMore);

      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMore() {
    if (!nextCursor) {
      return;
    }

    try {
      const result = await getMyNotifications(nextCursor);

      setNotifications((prev) => [...prev, ...result.notifications]);

      setHasMore(result.hasMore);

      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error(error);
    }
  }

  async function readNotification(notificationId: string) {
    await markNotificationReadAction(notificationId);

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? {
              ...item,

              is_read: true,
            }
          : item,
      ),
    );
  }

  async function readAllNotifications() {
    await markAllNotificationsAsRead();

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,

        is_read: true,
      })),
    );
  }

  useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  void Promise.resolve().then(() => loadNotifications());

  (async () => {
    unsubscribe = await subscribeNotifications(loadNotifications);
  })();

  return () => {
    unsubscribe?.();
  };
}, [loadNotifications]);

  return {
    notifications,

    loading,

    hasMore,

    loadMore,

    loadNotifications,

    readNotification,

    readAllNotifications,
  };
}