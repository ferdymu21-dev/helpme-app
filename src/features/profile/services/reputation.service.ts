import { supabase } from "@/lib/supabase/client";

export async function getUserReputation(
  userId: string
) {

  /* =========================
     GET REVIEWS
  ========================= */

  const {
    data: reviews,
    error: reviewsError,
  } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewer_user_id", userId);

  if (reviewsError) {
    throw reviewsError;
  }

  /* =========================
     CALCULATE RATING
  ========================= */

  const totalReviews =
    reviews?.length || 0;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (acc, item) =>
              acc + item.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  /* =========================
     GET COMPLETED TASKS
  ========================= */

  const {
    count: completedTasks,
    error: tasksError,
  } = await supabase
    .from("tasks")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "selected_helper_id",
      userId
    )
    .eq("status", "COMPLETED");

  if (tasksError) {
    throw tasksError;
  }

  return {
  averageRating,
  totalReviews,

  completedTasks:
    completedTasks || 0,
};
}