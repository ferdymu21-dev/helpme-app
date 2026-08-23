import type {
  CreateCampaignPayload,
  InsertCampaignPayload,
} from "../types/campaign.types";

export function buildCampaignBase(
  payload: CreateCampaignPayload,
): Omit<InsertCampaignPayload, "status" | "published_at" | "scheduled_at"> {
  return {
    title: payload.title,

    message: payload.message,

    image_url: payload.imageUrl ?? null,

    redirect_url: payload.redirectUrl ?? null,

    category: payload.category,

    type: payload.type,

    target_type: payload.targetType,

    target_value: payload.targetValue ?? null,

    expires_at: payload.expiresAt ?? null,
  };
}