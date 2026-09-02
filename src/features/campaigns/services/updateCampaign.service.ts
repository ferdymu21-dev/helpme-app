import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  isAbsoluteDateTime,
} from "../utils/campaign-date";

import {
  updateCampaignRepository,
} from "../repositories";

import type {
  NotificationCampaign,
  UpdateCampaignPayload,
} from "../types/campaign.types";

export async function updateCampaignService(
  payload: UpdateCampaignPayload,
): Promise<NotificationCampaign> {
  await requireAdmin();

  if (!payload.id) {
    throw new Error(
      "Campaign ID tidak ditemukan.",
    );
  }

  if (
    payload.title !==
      undefined &&
    !payload.title.trim()
  ) {
    throw new Error(
      "Judul wajib diisi.",
    );
  }

  if (
    payload.message !==
      undefined &&
    !payload.message.trim()
  ) {
    throw new Error(
      "Pesan wajib diisi.",
    );
  }

  if (
    payload.scheduledAt !==
      undefined &&
    payload.scheduledAt !== "" &&
    !isAbsoluteDateTime(
      payload.scheduledAt,
    )
  ) {
    throw new Error(
      "Format scheduledAt tidak valid.",
    );
  }

  if (
    payload.expiresAt !==
      undefined &&
    payload.expiresAt !== "" &&
    !isAbsoluteDateTime(
      payload.expiresAt,
    )
  ) {
    throw new Error(
      "Format expiresAt tidak valid.",
    );
  }

  if (
    payload.scheduledAt &&
    payload.expiresAt &&
    new Date(
      payload.expiresAt,
    ).getTime() <=
      new Date(
        payload.scheduledAt,
      ).getTime()
  ) {
    throw new Error(
      "Tanggal selesai harus setelah publish.",
    );
  }

  return updateCampaignRepository(
    payload,
  );
}