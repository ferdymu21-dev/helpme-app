"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createServiceListingDraftService,
} from "../services/create-service-listing-draft.service";

import {
  createServiceListingEditableFieldsFromForm,
} from "../utils/service-listing-form";

import {
  useServiceListingForm,
} from "./useServiceListingForm";

export function useCreateServiceListingPage() {
  const router =
    useRouter();

  const form =
    useServiceListingForm();

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
    ) {
      return;
    }

    setErrorMessage(
      null,
    );

    setSubmitting(
      true,
    );

    try {
      const editableFields =
        createServiceListingEditableFieldsFromForm(
          form.values,
        );

      const result =
        await createServiceListingDraftService(
          editableFields,
        );

      router.replace(
        `/my-services/${encodeURIComponent(
          result.listingId,
        )}/edit`,
      );
    } catch (error) {
      console.error(
        "CREATE SERVICE LISTING DRAFT ERROR:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan draft jasa.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  function handleBack() {
    if (
      submitting
    ) {
      return;
    }

    router.back();
  }

  function handleUnavailableMedia() {
    setErrorMessage(
      "Simpan draft terlebih dahulu sebelum menambahkan foto.",
    );
  }

  return {
    values:
      form.values,

    submitting,

    errorMessage,

    onBack:
      handleBack,

    onSubmit:
      handleSubmit,

    onTitleChange:
      form.onTitleChange,

    onCategoryChange:
      form.onCategoryChange,

    onCustomCategoryChange:
      form.onCustomCategoryChange,

    onDescriptionChange:
      form.onDescriptionChange,

    onDeliverablesChange:
      form.onDeliverablesChange,

    onCustomerPreparationChange:
      form.onCustomerPreparationChange,

    onPriceFromChange:
      form.onPriceFromChange,

    onNegotiableChange:
      form.onNegotiableChange,

    onServiceModeChange:
      form.onServiceModeChange,

    onLocationNameChange:
      form.onLocationNameChange,

    onUnavailableMedia:
      handleUnavailableMedia,
  };
}