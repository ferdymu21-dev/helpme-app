import {
  CampaignAction,
} from "../constants/campaign-action";

import {
  isAbsoluteDateTime,
} from "../utils/campaign-date";

import type {
  CreateCampaignPayload,
} from "../types/campaign.types";

export function validateCreateCampaign(
  payload: CreateCampaignPayload,
): void {
  /*
   * SCHEDULE
   */

  if (
    payload.action ===
      CampaignAction.SCHEDULE &&
    !payload.scheduledAt
  ) {
    throw new Error(
      "Campaign terjadwal harus memiliki scheduledAt.",
    );
  }

  /*
   * PUBLISH
   */

  if (
    payload.action ===
      CampaignAction.PUBLISH &&
    payload.scheduledAt
  ) {
    throw new Error(
      "Campaign Publish tidak boleh memiliki scheduledAt.",
    );
  }

  /*
   * DRAFT
   */

  if (
    payload.action ===
      CampaignAction.DRAFT &&
    payload.scheduledAt
  ) {
    throw new Error(
      "Campaign Draft tidak boleh memiliki scheduledAt.",
    );
  }

  /*
   * Server hanya menerima waktu
   * absolut yang sudah mempunyai
   * timezone.
   */

  if (
    payload.scheduledAt &&
    !isAbsoluteDateTime(
      payload.scheduledAt,
    )
  ) {
    throw new Error(
      "Format scheduledAt tidak valid.",
    );
  }

  if (
    payload.expiresAt &&
    !isAbsoluteDateTime(
      payload.expiresAt,
    )
  ) {
    throw new Error(
      "Format expiresAt tidak valid.",
    );
  }

  /*
   * Expiry harus setelah schedule.
   */

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
}