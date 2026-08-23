"use server";

import { adminSupabase } from "@/lib/supabase/admin";

import { createNotificationServer } from "../../server";

import { NotificationFactory } from "../../factories/NotificationFactory";

export async function notifyTaskCompletionProofSubmitted(taskId: string) {
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

  if (!task?.user_id) return;

  const payload = NotificationFactory.taskCompletionProofSubmitted(
    task.user_id,
    task.id,
  );

  await createNotificationServer(payload);
}