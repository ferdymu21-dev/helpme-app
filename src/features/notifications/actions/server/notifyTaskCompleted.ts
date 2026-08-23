"use server";

import { NotificationFactory } from "../../factories/NotificationFactory";

import { createNotificationServer } from "../../server";

import { adminSupabase } from "@/lib/supabase/admin";

export async function notifyTaskCompleted(taskId: string) {
  const { data: task, error } = await adminSupabase
    .from("tasks")
    .select(
      `
      id,
      title,
      user_id,
      selected_helper_id
    `,
    )
    .eq("id", taskId)
    .single();

  if (error) throw error;

  if (!task?.selected_helper_id) {
    return;
  }

  const payload = NotificationFactory.taskCompletionConfirmed(
    task.selected_helper_id,
    task.id,
  );

  await createNotificationServer(payload);
}