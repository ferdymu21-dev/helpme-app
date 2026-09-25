"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";

import type { Notification } from "@/features/notifications/types/notification.types";

import NotificationPageUI from "@/features/notifications/components/NotificationPageUI";

import { recordCampaignClickAction } from "@/features/campaigns/actions";

export default function NotificationsPage() {
  const router = useRouter();

  const [openingNotificationId, setOpeningNotificationId] =
    useState<string | null>(null);

  const {
    notifications,
    loading,
    hasMore,
    readNotification,
    readAllNotifications,
    loadMore,
  } = useNotifications();

  const hasUnread = notifications.some((notification) => !notification.is_read);

  function handleRead(notification: Notification) {
    const redirectUrl =
      notification.redirect_url;

    if (redirectUrl) {
      setOpeningNotificationId(
        notification.id,
      );
    }

    void readNotification(
      notification.id,
    ).catch((error) => {
      console.error(
        "Gagal menandai notification sebagai read:",
        error,
      );
    });

    void recordCampaignClickAction(
      notification.id,
    ).catch((error) => {
      console.error(
        "Gagal mencatat campaign click:",
        error,
      );
    });

    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }

  return (
    <NotificationPageUI
      notifications={notifications}
      loading={loading}
      onRead={handleRead}
      openingNotificationId={
        openingNotificationId
      }
      onMarkAllRead={readAllNotifications}
      hasUnread={hasUnread}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}