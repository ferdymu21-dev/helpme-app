import { adminSupabase } from "@/lib/supabase/admin";

import type { CreateNotificationPayload } from "../types/notification.types";

import { NotificationTypeCategoryMap } from "../constants/notification-type-category-map";

export async function createNotificationServer({
  userId,
  title,
  message,
  type,
  taskId,
  campaignId,
  imageUrl,
  redirectUrl,
}: CreateNotificationPayload) {
  const category = NotificationTypeCategoryMap[type];

  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .insert({
      user_id: userId,

      title,

      message,

      category,

      type,

      task_id: taskId ?? null,

      campaign_id: campaignId ?? null,

      image_url: imageUrl ?? null,

      redirect_url: redirectUrl ?? null,

      is_read: false,
    })
    .select()
    .single();

  /*
   * Campaign notification mempunyai
   * UNIQUE(campaign_id, user_id).
   *
   * Jika retry/concurrent scheduler
   * mencoba recipient yang sudah
   * mempunyai notification, gunakan
   * row existing dan jangan membuat
   * notification kedua.
   */
  if (error?.code === "23505" && campaignId) {
    const {
      data: existingNotification,

      error: existingError,
    } = await adminSupabase
      .from("notifications")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingNotification) {
      return existingNotification;
    }
  }

  if (error) {
    console.error(error);

    throw error;
  }

  return notification;
}