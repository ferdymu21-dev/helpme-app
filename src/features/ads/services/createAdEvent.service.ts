import "server-only";

import {
  createAdEventRepository,
  type AdEventType,
} from "@/features/ads/repositories/createAdEvent.repository";

const AD_EVENT_TYPES: AdEventType[] = ["impression", "click"];

function isAdEventType(value: string): value is AdEventType {
  return AD_EVENT_TYPES.includes(value as AdEventType);
}

export async function createAdEventService(adId: string, eventType: string) {
  if (!adId) {
    throw new Error("INVALID_AD_ID");
  }

  if (!isAdEventType(eventType)) {
    throw new Error("INVALID_EVENT_TYPE");
  }

  return createAdEventRepository({
    adId,
    eventType,
  });
}