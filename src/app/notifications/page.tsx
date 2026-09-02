"use client";

import { useRouter } from "next/navigation";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";

import type { Notification } from "@/features/notifications/types/notification.types";

import NotificationPageUI from "@/features/notifications/components/NotificationPageUI";

import { recordCampaignClickAction } from "@/features/campaigns/actions";

export default function NotificationsPage() {
  const router = useRouter();

  const {
    notifications,
    loading,
    hasMore,
    readNotification,
    readAllNotifications,
    loadMore,
  } = useNotifications();

  const hasUnread = notifications.some((notification) => !notification.is_read);

  async function handleRead(notification: Notification) {
    try {
      await readNotification(notification.id);
    } catch (error) {
      console.error("Gagal menandai notification sebagai read:", error);

      return;
    }

    try {
      await recordCampaignClickAction(notification.id);
    } catch (error) {
      console.error("Gagal mencatat campaign click:", error);
    }

    if (notification.redirect_url) {
      router.push(notification.redirect_url);
    }
  }

  return (
    <NotificationPageUI
      notifications={notifications}
      loading={loading}
      onRead={handleRead}
      onMarkAllRead={readAllNotifications}
      hasUnread={hasUnread}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}