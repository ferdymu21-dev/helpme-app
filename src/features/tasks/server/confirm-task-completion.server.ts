import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskCompleted } from "@/features/notifications/actions/server";

export async function confirmTaskCompletionServer(
  taskId: string,
  ownerId: string,
) {
  /* =========================
     GET TASK
  ========================= */

  const { data: task, error: taskError } = await adminSupabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError) {
    throw taskError;
  }

  /* =========================
     ONLY OWNER
  ========================= */

  if (task.user_id !== ownerId) {
    throw new Error("Bukan pemilik task");
  }

  /* =========================
     TASK HARUS COMPLETED
  ========================= */

  if (task.status !== "WAITING_CONFIRMATION") {
    throw new Error("Task belum menunggu konfirmasi");
  }

  /* =========================
     HARUS ADA BUKTI
  ========================= */

  if (!task.completion_proof_photo) {
    throw new Error("Bukti penyelesaian belum diupload");
  }

  /* =========================
     UPDATE STATUS
  ========================= */

  const { error } = await adminSupabase
    .from("tasks")
    .update({
      status: "COMPLETED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    throw error;
  }

  /* =========================
     NOTIFY HELPER
  ========================= */

  await notifyTaskCompleted(taskId);

  return true;
}