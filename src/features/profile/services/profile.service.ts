import { supabase } from "@/lib/supabase/client";

export async function getUserReputation(userId: string) {
  try {
    /* COMPLETED TASKS */
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("selected_helper_id", userId)
      .eq("status", "COMPLETED");

    /* REVIEWS */
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", userId);

    const totalReviews = reviews?.length || 0;

    const averageRating =
      totalReviews > 0
        ? (
            (reviews || []).reduce((acc, item) => acc + item.rating, 0) /
            totalReviews
          ).toFixed(1)
        : "0.0";

    return {
      completedTasks: completedTasks || 0,

      totalReviews,

      averageRating,
    };
  } catch (error) {
    console.error(error);

    return {
      completedTasks: 0,
      totalReviews: 0,
      averageRating: "0.0",
    };
  }
}