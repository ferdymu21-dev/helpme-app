import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskCompleted } from "@/features/notifications/actions/server";

export async function confirmTaskCompletionServer(
  taskId: string,

  ownerId: string,
) {
  /*
   * Authorization + lifecycle dijadikan
   * bagian dari satu atomic UPDATE.
   *
   * Hanya owner dari task yang masih
   * WAITING_CONFIRMATION dan sudah
   * memiliki completion proof yang
   * dapat mengubah status ke COMPLETED.
   */
  const { data: task, error } = await adminSupabase
    .from("tasks")
    .update({
      status: "COMPLETED",

      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", ownerId)
    .eq("status", "WAITING_CONFIRMATION")
    .not("completion_proof_photo", "is", null)
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
      "Task tidak ditemukan, belum memiliki bukti penyelesaian, atau tidak dapat dikonfirmasi oleh akun ini.",
    );
  }

  await notifyTaskCompleted(task.id);

  return true;
}