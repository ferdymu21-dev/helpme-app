import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export type AdEventType = "impression" | "click";

interface CreateAdEventInput {
  adId: string;
  userId: string;
  eventType: AdEventType;
  dedupeBucket: number;
}

export interface CreatedAdEvent {
  id: string;
  ad_id: string;
  user_id: string;
  event_type: AdEventType;
  created_at: string;
}

export async function createAdEventRepository({
  adId,
  userId,
  eventType,
  dedupeBucket,
}: CreateAdEventInput): Promise<CreatedAdEvent | null> {
  const { data, error } = await adminSupabase
    .from("ad_events")
    .insert({
      ad_id: adId,
      user_id: userId,
      event_type: eventType,
      dedupe_bucket: dedupeBucket,
    })
    .select(
      `
        id,
        ad_id,
        user_id,
        event_type,
        created_at
      `,
    )
    .single();

  /*
   * Duplicate dalam server-defined time bucket
   * merupakan expected idempotent retry.
   */
  if (error?.code === "23505") {
    return null;
  }

  if (error) {
    console.error("createAdEventRepository error:", error);

    throw new Error("Gagal mencatat event iklan.");
  }

  if (!data) {
    throw new Error("Event iklan gagal dicatat.");
  }

  return data;
}