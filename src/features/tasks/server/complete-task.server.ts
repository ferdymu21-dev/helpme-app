import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskCompletionProofSubmitted } from "@/features/notifications/actions/server";

export async function completeTaskServer(
  taskId: string,
  proofUrl: string,
  helperId: string,
) {
  // ambil task
  const { data: task, error } = await adminSupabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw error;

  if (task.selected_helper_id !== helperId) {
    throw new Error("Bukan helper yang dipilih");
  }

  if (task.status !== "ACCEPTED") {
    throw new Error("Task tidak dapat diselesaikan");
  }

  const { error: updateError } = await adminSupabase
    .from("tasks")
    .update({
      status: "WAITING_CONFIRMATION",
      completion_proof_photo: proofUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (updateError) {
    throw updateError;
  }

  /* =========================
   NOTIFY OWNER
========================= */

  await notifyTaskCompletionProofSubmitted(taskId);

  return true;
}