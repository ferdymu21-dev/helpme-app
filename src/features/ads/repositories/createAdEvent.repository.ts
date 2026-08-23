import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export type AdEventType = "impression" | "click";

interface CreateAdEventInput {
  adId: string;
  eventType: AdEventType;
}

export async function createAdEventRepository({
  adId,
  eventType,
}: CreateAdEventInput) {
  const { data, error } = await adminSupabase
    .from("ad_events")
    .insert({
      ad_id: adId,
      event_type: eventType,
    })
    .select("id, ad_id, event_type, created_at")
    .single();

  if (error) {
    console.error("createAdEventRepository error:", error);

    throw new Error("Gagal mencatat event iklan.");
  }

  if (!data) {
    throw new Error("Event iklan gagal dicatat.");
  }

  return data;
}