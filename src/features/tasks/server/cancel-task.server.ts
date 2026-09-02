import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskCancelled } from "@/features/notifications/actions/server";

export async function cancelTaskServer(
  taskId: string,

  ownerId: string,
) {
  const { data: task, error: taskError } = await adminSupabase
    .from("tasks")
    .select(
      `
        id,
        user_id,
        status,
        selected_helper_id
      `,
    )
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!task) {
    throw new Error("Task tidak ditemukan.");
  }

  if (task.user_id !== ownerId) {
    throw new Error("Bukan pemilik task.");
  }

  const cancellableStatuses = ["OPEN", "ACCEPTED"];

  if (!cancellableStatuses.includes(task.status)) {
    throw new Error("Task sudah tidak dapat dibatalkan.");
  }

  /*
   * Optimistic lifecycle guard.
   *
   * UPDATE hanya berhasil jika status
   * task masih sama dengan status yang
   * baru saja kita authorize.
   */
  const { data: cancelledTask, error: cancelError } = await adminSupabase
    .from("tasks")
    .update({
      status: "CANCELLED",
    })
    .eq("id", taskId)
    .eq("user_id", ownerId)
    .eq("status", task.status)
    .select(
      `
        id
      `,
    )
    .maybeSingle();

  if (cancelError) {
    throw cancelError;
  }

  if (!cancelledTask) {
    throw new Error(
      "Status task telah berubah. Silakan muat ulang dan coba lagi.",
    );
  }

  /*
   * Gunakan status sebelum cancellation
   * untuk menentukan notification.
   */
  if (task.status === "ACCEPTED" && task.selected_helper_id) {
    await notifyTaskCancelled(
      task.selected_helper_id,

      task.id,
    );
  }

  return true;
}