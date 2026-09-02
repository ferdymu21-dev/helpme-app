import "server-only";

import {
  createAdEventRepository,
  type AdEventType,
} from "@/features/ads/repositories/createAdEvent.repository";

import { getTrackableAdRepository } from "@/features/ads/repositories/getTrackableAd.repository";

const AD_EVENT_TYPES: AdEventType[] = ["impression", "click"];

const IMPRESSION_DEDUPE_WINDOW_MS = 5 * 60 * 1000;

const CLICK_DEDUPE_WINDOW_MS = 60 * 1000;

function isAdEventType(value: string): value is AdEventType {
  return AD_EVENT_TYPES.includes(value as AdEventType);
}

function getDedupeWindowMs(eventType: AdEventType): number {
  if (eventType === "impression") {
    return IMPRESSION_DEDUPE_WINDOW_MS;
  }

  return CLICK_DEDUPE_WINDOW_MS;
}

function createDedupeBucket(eventType: AdEventType): number {
  const windowMs = getDedupeWindowMs(eventType);

  return Math.floor(Date.now() / windowMs);
}

export async function createAdEventService(
  adId: string,
  eventType: string,
  userId: string,
) {
  if (!adId) {
    throw new Error("INVALID_AD_ID");
  }

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  if (!isAdEventType(eventType)) {
    throw new Error("INVALID_EVENT_TYPE");
  }

  const ad = await getTrackableAdRepository(adId);

  if (!ad) {
    throw new Error("AD_NOT_TRACKABLE");
  }

  return createAdEventRepository({
    adId: ad.id,
    userId,
    eventType,
    dedupeBucket: createDedupeBucket(eventType),
  });
}