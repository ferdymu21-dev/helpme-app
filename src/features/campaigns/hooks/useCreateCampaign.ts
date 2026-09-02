"use client";

import { useState } from "react";

import { uploadCampaignImage } from "../services/uploadCampaignImage.service";

import { createCampaignAction } from "../actions";

import { CampaignAction } from "../constants/campaign-action";

import { NotificationCategory } from "@/features/notifications/constants/notification-category";

import { NotificationType } from "@/features/notifications/constants/notification-type";

import { CampaignTarget } from "../constants/campaign-target";

import type { CreateCampaignPayload } from "../types/campaign.types";

import { validateCampaignForm } from "../forms/campaign-form.validator";

import { localDateTimeToIso } from "../utils/campaign-date";

import type { CampaignFormErrors } from "../forms/campaign-form.types";

export function useCreateCampaign() {
  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [success, setSuccess] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState<CampaignFormErrors>({});

  const [form, setForm] = useState<CreateCampaignPayload>({
    action: CampaignAction.DRAFT,
    title: "",
    message: "",
    imageUrl: "",
    redirectUrl: "",
    category: NotificationCategory.INFO,
    type: NotificationType.INFO_BROADCAST,
    targetType: CampaignTarget.ALL,
    targetValue: "",
    scheduledAt: "",
    expiresAt: "",
  });

  function setField<K extends keyof CreateCampaignPayload>(
    field: K,
    value: CreateCampaignPayload[K],
  ) {
    setForm((previous) => {
      const next = {
        ...previous,

        [field]: value,
      };

      /*
    ---------------------------------------
    Jika action berubah selain Schedule,
    scheduledAt otomatis dibersihkan.
    ---------------------------------------
    */

      if (field === "action" && value !== CampaignAction.SCHEDULE) {
        next.scheduledAt = "";
      }

      return next;
    });

    clearFieldError(field as keyof CampaignFormErrors);
  }

  function clearFieldError(field: keyof CampaignFormErrors) {
    setErrors((previous) => ({
      ...previous,

      [field]: undefined,
    }));
  }

  function reset() {
    setForm({
      action: CampaignAction.DRAFT,
      title: "",
      message: "",
      imageUrl: "",
      redirectUrl: "",
      category: NotificationCategory.INFO,
      type: NotificationType.INFO_BROADCAST,
      targetType: CampaignTarget.ALL,
      targetValue: "",
      scheduledAt: "",
      expiresAt: "",
    });

    setErrors({});
    setSuccess(false);
    setSuccessMessage("");
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
    const validationErrors = validateCampaignForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      return;
    }

    setErrors({});

    setLoading(true);

    try {
      const payload: CreateCampaignPayload = {
        ...form,
      };

      /*
---------------------------------------
Schedule hanya boleh mengirim scheduledAt
---------------------------------------
*/

      if (payload.action !== CampaignAction.SCHEDULE) {
        payload.scheduledAt = undefined;
      }

      /*
---------------------------------------
Kosong → undefined
---------------------------------------
*/

      if (!payload.targetValue) {
        payload.targetValue = undefined;
      }

      if (!payload.imageUrl) {
        payload.imageUrl = undefined;
      }

      if (!payload.redirectUrl) {
        payload.redirectUrl = undefined;
      }

      if (!payload.expiresAt) {
        payload.expiresAt = undefined;
      }

      /*
---------------------------------------
Schedule hanya boleh mengirim scheduledAt
---------------------------------------
*/

      if (payload.action !== CampaignAction.SCHEDULE) {
        payload.scheduledAt = undefined;
      }

      /*
---------------------------------------
datetime-local browser
→ UTC ISO
---------------------------------------
*/

      if (payload.scheduledAt) {
        payload.scheduledAt = localDateTimeToIso(payload.scheduledAt);
      }

      if (payload.expiresAt) {
        payload.expiresAt = localDateTimeToIso(payload.expiresAt);
      }

      /*
---------------------------------------
Kosong → undefined
---------------------------------------
*/

      if (!payload.targetValue) {
        payload.targetValue = undefined;
      }

      if (!payload.imageUrl) {
        payload.imageUrl = undefined;
      }

      if (!payload.redirectUrl) {
        payload.redirectUrl = undefined;
      }

      if (!payload.expiresAt) {
        payload.expiresAt = undefined;
      }

      await createCampaignAction(payload);

      setSuccess(true);

      setSuccessMessage("Campaign berhasil dibuat.");
    } catch (error) {
      console.error(error);

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
    success,
    successMessage,
    setSuccess,
    setSuccessMessage,
    setField,
    uploadImage,
    clearFieldError,
    reset,
    submit,
  };
}