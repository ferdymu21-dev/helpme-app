import type { CampaignFormErrors } from "./campaign-form.types";

import type { CreateCampaignPayload } from "../types/campaign.types";

export function validateCampaignForm(
  form: CreateCampaignPayload,
): CampaignFormErrors {
  const errors: CampaignFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Judul campaign wajib diisi.";
  }

  if (!form.message.trim()) {
    errors.message = "Pesan campaign wajib diisi.";
  }

  if (form.action === "SCHEDULE" && !form.scheduledAt) {
    errors.scheduledAt = "Tanggal publish wajib dipilih.";
  }

  if (form.scheduledAt && form.expiresAt) {
    if (new Date(form.expiresAt) <= new Date(form.scheduledAt)) {
      errors.expiresAt = "Tanggal selesai harus setelah publish.";
    }
  }

  return errors;
}