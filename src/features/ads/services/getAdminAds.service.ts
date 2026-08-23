import { requireAdmin } from "@/features/admin/services/admin-auth.service";

import { getAdminAdsRepository } from "../repositories/getAdminAds.repository";
import { getAdStatsRepository } from "../repositories/getAdStats.repository";
import type { AdWithStats } from "../types/ad.types";

export async function getAdminAdsService(): Promise<AdWithStats[]> {
  await requireAdmin();

  const ads = await getAdminAdsRepository();

  const adIds = ads.map((ad) => ad.id);

  const stats = await getAdStatsRepository(adIds);

  return ads.map((ad) => {
    const adStats = stats[ad.id] ?? {
      impressions: 0,
      clicks: 0,
    };

    return {
      ...ad,
      stats: {
        impressions: adStats.impressions,
        clicks: adStats.clicks,
        ctr:
          adStats.impressions > 0
            ? (adStats.clicks / adStats.impressions) * 100
            : 0,
      },
    };
  });
}