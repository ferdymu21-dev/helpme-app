import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type { AdEventStats } from "../types/ad.types";

export async function getAdStatsRepository(
  adIds: string[],
): Promise<Record<string, AdEventStats>> {
  if (adIds.length === 0) {
    return {};
  }

  const { data, error } = await adminSupabase
    .from("ad_events")
    .select("ad_id, event_type")
    .in("ad_id", adIds);

  if (error) {
    console.error("getAdStatsRepository error:", error);

    throw new Error("Gagal mengambil statistik iklan.");
  }

  const stats: Record<string, AdEventStats> = {};

  for (const adId of adIds) {
    stats[adId] = {
      impressions: 0,
      clicks: 0,
    };
  }

  for (const event of data ?? []) {
    if (!stats[event.ad_id]) {
      stats[event.ad_id] = {
        impressions: 0,
        clicks: 0,
      };
    }

    if (event.event_type === "impression") {
      stats[event.ad_id].impressions += 1;
    }

    if (event.event_type === "click") {
      stats[event.ad_id].clicks += 1;
    }
  }

  return stats;
}