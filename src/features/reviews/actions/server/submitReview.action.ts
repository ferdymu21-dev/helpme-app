"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { notifyReviewCreated } from "@/features/notifications/actions/server";

interface SubmitReviewPayload {
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export async function submitReviewAction(payload: SubmitReviewPayload) {
  const { taskId, reviewerId, revieweeId, rating, comment } = payload;

  const { error } = await adminSupabase.from("reviews").insert({
    task_id: taskId,
    reviewer_id: reviewerId,
    reviewee_id: revieweeId,
    rating,
    comment,
  });

  if (error) {
    throw error;
  }

  await notifyReviewCreated(revieweeId);
}