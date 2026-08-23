import { supabase } from "@/lib/supabase/client";

/* =========================
   GET USER REVIEWS
========================= */

export async function getUserReviews(
  userId: string,
  limit = 5,
  offset = 0,
) {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
        id,
        rating,
        comment,
        created_at,

        reviewer:users!reviews_reviewer_id_fkey (
          id,
          full_name
        )
      `,
    )
    .eq("reviewee_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data || [];
}