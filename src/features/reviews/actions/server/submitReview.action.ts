"use server";

import { adminSupabase } from "@/lib/supabase/admin";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { notifyReviewCreated } from "@/features/notifications/actions/server";

interface SubmitReviewPayload {
  taskId: string;

  rating: number;

  comment: string;
}

export async function submitReviewAction(payload: SubmitReviewPayload) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { taskId, rating, comment } = payload;

  if (typeof taskId !== "string" || !taskId) {
    throw new Error("Task tidak valid.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating harus antara 1 sampai 5.");
  }

  if (typeof comment !== "string") {
    throw new Error("Komentar tidak valid.");
  }

  /*
   * Reviewer ditentukan oleh session,
   * bukan argument dari browser.
   *
   * Saat ini flow ReviewPage adalah
   * Owner → Helper, jadi current user
   * harus merupakan owner task.
   */
  const { data: task, error: taskError } = await adminSupabase
    .from("tasks")
    .select(
      `
        id,
        user_id,
        selected_helper_id,
        status
      `,
    )
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!task) {
    throw new Error("Task tidak ditemukan atau Anda bukan pemilik task.");
  }

  if (task.status !== "COMPLETED") {
    throw new Error("Task belum dapat direview.");
  }

  if (!task.selected_helper_id) {
    throw new Error("Helper task tidak ditemukan.");
  }

  /*
   * Application-level duplicate guard.
   *
   * Database UNIQUE constraint akan
   * menjadi final concurrency guard
   * setelah audit data review selesai.
   */
  const { data: existingReview, error: existingReviewError } =
    await adminSupabase
      .from("reviews")
      .select("id")
      .eq("task_id", task.id)
      .eq("reviewer_id", user.id)
      .eq("reviewee_id", task.selected_helper_id)
      .maybeSingle();

  if (existingReviewError) {
    throw existingReviewError;
  }

  if (existingReview) {
    throw new Error("Review untuk task ini sudah diberikan.");
  }

  const { error: insertError } = await adminSupabase.from("reviews").insert({
    task_id: task.id,

    reviewer_id: user.id,

    reviewee_id: task.selected_helper_id,

    rating,

    comment: comment.trim(),
  });

  /*
   * Akan berguna setelah UNIQUE
   * constraint ditambahkan.
   */
  if (insertError?.code === "23505") {
    throw new Error("Review untuk task ini sudah diberikan.");
  }

  if (insertError) {
    throw insertError;
  }

  await notifyReviewCreated(task.selected_helper_id);
}