import { supabase }
from "@/lib/supabase/client";

/* =========================
   GET USER REVIEWS
========================= */

export async function getUserReviews(
  userId: string
) {

  const { data, error } =
    await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,

        reviewer:users!reviews_reviewer_id_fkey (
          id,
          full_name
        )
      `)
      .eq(
        "reviewer_user_id",
        userId
      )
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}
