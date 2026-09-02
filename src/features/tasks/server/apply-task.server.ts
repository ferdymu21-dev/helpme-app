import { adminSupabase } from "@/lib/supabase/admin";

import { notifyTaskApplied } from "@/features/notifications/actions/server";

export class TaskAlreadyAppliedError extends Error {
  constructor() {
    super("Kamu sudah melamar task ini");
    this.name = "TaskAlreadyAppliedError";
  }
}

export async function applyTaskServer(taskId: string, userId: string) {
  /* =========================
     GET TASK
  ========================= */

  const { data: task, error: taskError } = await adminSupabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Permintaan bantuan tidak ditemukan");
  }

  /* =========================
     CANNOT APPLY OWN TASK
  ========================= */

  if (task.user_id === userId) {
    throw new Error("Tidak bisa melamar task sendiri");
  }

  /* =========================
     TASK MUST BE OPEN
  ========================= */

  if (task.status !== "OPEN") {
    throw new Error("Permintaan bantuan ini sudah ditutup");
  }

  /* =========================
     CHECK EXISTING APPLICATION
  ========================= */

  const { data: existing, error: existingError } = await adminSupabase
    .from("task_applications")
    .select("id")
    .eq("task_id", taskId)
    .eq("helper_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    throw new TaskAlreadyAppliedError();
  }

  /* =========================
     CREATE APPLICATION
  ========================= */

  const { data, error } = await adminSupabase
    .from("task_applications")
    .insert([
      {
        task_id: taskId,
        helper_id: userId,
        status: "PENDING",
      },
    ])
    .select()
    .single();

  /*
   * The database has a UNIQUE(task_id, helper_id) constraint.
   *
   * The initial existence check improves normal UX, but two
   * concurrent requests can both pass that check. PostgreSQL
   * remains the final authority and rejects the second insert
   * with SQLSTATE 23505.
   */
  if (error?.code === "23505") {
    throw new TaskAlreadyAppliedError();
  }

  if (error) {
    throw error;
  }

  /* =========================
     CREATE NOTIFICATION
  ========================= */

  await notifyTaskApplied(task.user_id, task.id);

  return {
    application: data,
    task,
  };
}