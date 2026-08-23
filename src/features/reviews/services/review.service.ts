import { supabase } from "@/lib/supabase/client";

export interface ReviewUser {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;

  reviewer:
    | ReviewUser
    | ReviewUser[]
    | null;
}

/* =========================
   GET USER REVIEWS
========================= */

export async function getUserReviews(
  userId: string,
  limit = 5,
  offset = 0,
): Promise<UserReview[]> {
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
          full_name,
          avatar_url
        )
      `,
    )
    .eq("reviewee_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .range(
      offset,
      offset + limit - 1,
    );

  if (error) {
    throw error;
  }

  return data || [];
}