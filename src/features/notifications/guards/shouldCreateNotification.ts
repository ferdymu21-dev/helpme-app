import { adminSupabase } from "@/lib/supabase/admin";

import type { NotificationTypeValue } from "../constants/notification-type";

interface Params {
  userId: string;

  type: NotificationTypeValue;

  taskId?: string;
}

export async function shouldCreateNotification({
  userId,

  type,

  taskId,
}: Params) {
  let query = adminSupabase

    .from("notifications")

    .select("id")

    .eq("user_id", userId)

    .eq("type", type);

  if (taskId) {
    query = query.eq(
      "task_id",

      taskId,
    );
  }

  const {
    data,

    error,
  } = await query

    .order(
      "created_at",

      {
        ascending: false,
      },
    )

    .limit(1);

  if (error) {
    throw error;
  }

  return data.length === 0;
}