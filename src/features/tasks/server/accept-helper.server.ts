import { adminSupabase } from "@/lib/supabase/admin";

import { createConversationServer } from "./create-conversation.server";

import { notifyTaskAccepted } from "@/features/notifications/actions/server";

export async function acceptHelperServer(
  taskId: string,

  helperId: string,

  ownerId: string,
) {
  /*
   * Ambil task terlebih dahulu untuk
   * memastikan requester memang owner.
   */
  const { data: task, error: taskError } = await adminSupabase
    .from("tasks")
    .select(
      `
        id,
        user_id,
        status
      `,
    )
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!task) {
    throw new Error("Permintaan bantuan tidak ditemukan.");
  }

  if (task.user_id !== ownerId) {
    throw new Error("Bukan pemilik task.");
  }

  if (task.status !== "OPEN") {
    throw new Error("Task sudah tidak dapat menerima helper.");
  }

  /*
   * Helper hanya boleh dipilih jika
   * benar-benar mempunyai lamaran
   * PENDING untuk task tersebut.
   */
  const { data: application, error: applicationError } = await adminSupabase
    .from("task_applications")
    .select(
      `
        id
      `,
    )
    .eq("task_id", taskId)
    .eq("helper_id", helperId)
    .eq("status", "PENDING")
    .maybeSingle();

  if (applicationError) {
    throw applicationError;
  }

  if (!application) {
    throw new Error("Helper tidak memiliki lamaran aktif untuk task ini.");
  }

  /*
   * Atomic winner gate.
   *
   * Walaupun dua request sebelumnya
   * sama-sama sempat membaca OPEN,
   * hanya satu UPDATE OPEN → ACCEPTED
   * yang boleh berhasil.
   */
  const { data: acceptedTask, error: acceptError } = await adminSupabase
    .from("tasks")
    .update({
      status: "ACCEPTED",

      selected_helper_id: helperId,
    })
    .eq("id", taskId)
    .eq("user_id", ownerId)
    .eq("status", "OPEN")
    .select(
      `
        id
      `,
    )
    .maybeSingle();

  if (acceptError) {
    throw acceptError;
  }

  if (!acceptedTask) {
    throw new Error("Task sudah diproses oleh permintaan lain.");
  }

  /*
   * Reject applicant lain.
   */
  const { error: rejectError } = await adminSupabase
    .from("task_applications")
    .update({
      status: "REJECTED",
    })
    .eq("task_id", taskId)
    .neq("helper_id", helperId);

  if (rejectError) {
    throw rejectError;
  }

  /*
   * Tandai application helper terpilih.
   */
  const { data: acceptedApplication, error: acceptedApplicationError } =
    await adminSupabase
      .from("task_applications")
      .update({
        status: "ACCEPTED",
      })
      .eq("id", application.id)
      .eq("status", "PENDING")
      .select(
        `
        id
      `,
      )
      .maybeSingle();

  if (acceptedApplicationError) {
    throw acceptedApplicationError;
  }

  if (!acceptedApplication) {
    throw new Error("Lamaran helper sudah berubah dan tidak dapat diterima.");
  }

  await createConversationServer(
    taskId,

    helperId,
  );

  await notifyTaskAccepted(
    helperId,

    taskId,
  );

  return true;
}