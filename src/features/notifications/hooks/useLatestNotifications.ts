"use client";

import { useCallback, useEffect, useState } from "react";

import { getLatestNotifications } from "../services";

import { subscribeNotifications } from "../realtime";

import type { Notification } from "../types/notification.types";

export function useLatestNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    const data = await getLatestNotifications();

    setNotifications(data);
  }, []);

  useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  void Promise.resolve().then(() => load());

  (async () => {
    unsubscribe = await subscribeNotifications(load);
  })();

  return () => {
    unsubscribe?.();
  };
}, [load]);

  return {
    notifications,
  };
}