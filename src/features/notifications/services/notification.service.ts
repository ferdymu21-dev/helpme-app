import { supabase }
  from "@/lib/supabase/client";

interface CreateNotificationPayload {
  userId: string;

  title: string;

  message: string;

  type: string;

  taskId?: string;

  redirectUrl?: string;
}

/* =========================
   CREATE NOTIFICATION
========================= */

export async function createNotification({
  userId,
  title,
  message,
  type,
  taskId,
  redirectUrl,
}: CreateNotificationPayload) {

  const { error } =
    await supabase
      .from("notifications")
      .insert({

        user_id: userId,

        title,

        message,

        type,

        task_id:
          taskId || null,

        redirect_url:
          redirectUrl || null,

        is_read: false,
      });

  if (error) {
    console.error(error);

    throw error;
  }
}

/* =========================
   GET MY NOTIFICATIONS
========================= */

export async function getMyNotifications() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User belum login"
    );
  }

  const { data, error } =
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}

/* =========================
   MARK AS READ
========================= */

export async function markNotificationAsRead(
  notificationId: string
) {

  const { error } =
    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

  if (error) {
    throw error;
  }
}