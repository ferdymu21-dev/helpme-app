import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

interface TrackableAd {
  id: string;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
}

export async function getTrackableAdRepository(
  adId: string,
): Promise<TrackableAd | null> {
  const now = new Date().toISOString();

  const { data, error } = await adminSupabase
    .from("ads")
    .select(
      `
        id,
        is_active,
        start_at,
        end_at
      `,
    )
    .eq("id", adId)
    .eq("is_active", true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}