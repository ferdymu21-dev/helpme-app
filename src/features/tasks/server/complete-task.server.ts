import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskCompletionProofSubmitted } from "@/features/notifications/actions/server";

export async function completeTaskServer(
  taskId: string,

  proofUrl: string,

  helperId: string,
) {
  /*
   * Authorization dan lifecycle
   * dijadikan satu atomic UPDATE.
   *
   * Hanya selected helper dari task
   * ACCEPTED yang dapat mengirim bukti.
   */
  const { data: task, error } = await adminSupabase
    .from("tasks")
    .update({
      status: "WAITING_CONFIRMATION",

      completion_proof_photo: proofUrl,

      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("selected_helper_id", helperId)
    .eq("status", "ACCEPTED")
    .select(
      `
        id
      `,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!task) {
    throw new Error(
      "Task tidak ditemukan atau tidak dapat diselesaikan oleh akun ini.",
    );
  }

  await notifyTaskCompletionProofSubmitted(task.id);

  return true;
}