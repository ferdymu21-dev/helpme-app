"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { updateCampaignAction } from "../actions";

import { mapCampaignToAction } from "../mappers/mapCampaignToAction";

import { isoToLocalDateTime, localDateTimeToIso } from "../utils/campaign-date";

import type {
  NotificationCampaign,
  CreateCampaignPayload,
} from "../types/campaign.types";

import type { CampaignFormController } from "../forms/campaign-form.props";

import type { CampaignFormErrors } from "../forms/campaign-form.types";

import { validateCampaignForm } from "../forms/campaign-form.validator";

import { uploadCampaignImage } from "../services/uploadCampaignImage.service";

export function useEditCampaign(
  campaign: NotificationCampaign,
): CampaignFormController {
  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const router = useRouter();

  const [errors, setErrors] = useState<CampaignFormErrors>({});

  const [form, setForm] = useState<CreateCampaignPayload>({
    action: mapCampaignToAction(campaign.status),

    title: campaign.title,

    message: campaign.message,

    imageUrl: campaign.image_url ?? "",

    redirectUrl: campaign.redirect_url ?? "",

    category: campaign.category,

    type: campaign.type,

    targetType: campaign.target_type,

    targetValue: campaign.target_value ?? "",

    scheduledAt: isoToLocalDateTime(campaign.scheduled_at),

    expiresAt: isoToLocalDateTime(campaign.expires_at),
  });

  function setField<K extends keyof CreateCampaignPayload>(
    field: K,

    value: CreateCampaignPayload[K],
  ) {
    setForm((previous) => ({
      ...previous,

      [field]: value,
    }));
  }

  function reset() {
    setForm({
      action: mapCampaignToAction(campaign.status),

      title: campaign.title,

      message: campaign.message,

      imageUrl: campaign.image_url ?? "",

      redirectUrl: campaign.redirect_url ?? "",

      category: campaign.category,

      type: campaign.type,

      targetType: campaign.target_type,

      targetValue: campaign.target_value ?? "",

      scheduledAt: isoToLocalDateTime(campaign.scheduled_at),

      expiresAt: isoToLocalDateTime(campaign.expires_at),
    });

    setErrors({});
  }

  async function uploadImage(file: File) {
    try {
      setUploadingImage(true);

      const imageUrl = await uploadCampaignImage(file);

      setField("imageUrl", imageUrl);
    } finally {
      setUploadingImage(false);
    }
  }

  async function submit() {
    const validation = validateCampaignForm(form);

    if (Object.keys(validation).length > 0) {
      setErrors(validation);

      return;
    }

    setErrors({});

    setLoading(true);

    try {
      await updateCampaignAction({
        id: campaign.id,

        title: form.title,

        message: form.message,

        imageUrl: form.imageUrl,

        redirectUrl: form.redirectUrl,

        targetType: form.targetType,

        targetValue: form.targetValue,

        scheduledAt: form.scheduledAt
          ? localDateTimeToIso(form.scheduledAt)
          : undefined,

        expiresAt: form.expiresAt
          ? localDateTimeToIso(form.expiresAt)
          : undefined,
      });

      router.push(`/admin/campaigns/${campaign.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    errors,
    loading,
    uploadingImage,
    setField,
    uploadImage,
    submit,
    reset,
  };
}