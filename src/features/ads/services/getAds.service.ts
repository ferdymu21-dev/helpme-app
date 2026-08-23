import { getAdsRepository } from "../repositories";

import type { Ad, AdPosition } from "../types/ad.types";

export async function getAdsService(position?: AdPosition): Promise<Ad[]> {
  const ads = await getAdsRepository(position);

  return ads;
}