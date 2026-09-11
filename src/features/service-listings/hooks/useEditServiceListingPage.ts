"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { ServiceListingStatus } from "../constants/service-listing-status";

import {
  deleteServiceListingImageClient,
  uploadServiceListingCoverClient,
  uploadServiceListingPortfolioImageClient,
} from "../services/service-listing-media.client.service";

import { getMyServiceListingDetailService } from "../services/get-my-service-listing-detail.service";

import { getMyServiceListingMediaService } from "../services/get-my-service-listing-media.service";

import { updateServiceListingService } from "../services/update-service-listing.service";

import type { ProviderServiceListingMedia } from "../types/service-listing-media.types";

import type { ProviderServiceListing } from "../types/service-listing-read.types";

import {
  areServiceListingFormValuesEqual,
  createServiceListingEditableFieldsFromForm,
  createServiceListingFormValuesFromListing,
} from "../utils/service-listing-form";

import { tryNormalizeServiceListingRouteId } from "../utils/service-listing-route";

import { useServiceListingForm } from "./useServiceListingForm";

export function useEditServiceListingPage(listingId: string) {
  const router = useRouter();

  const normalizedListingId = tryNormalizeServiceListingRouteId(listingId);

  const form = useServiceListingForm();

  const { replaceValues } = form;

  const [listing, setListing] = useState<ProviderServiceListing | null>(null);

  const [media, setMedia] = useState<ProviderServiceListingMedia[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [mediaBusy, setMediaBusy] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshMedia = useCallback(async () => {
    if (!normalizedListingId) {
      throw new Error("ID jasa tidak valid.");
    }

    const nextMedia =
      await getMyServiceListingMediaService(normalizedListingId);

    setMedia(nextMedia);
  }, [normalizedListingId]);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);

      setErrorMessage(null);

      if (!normalizedListingId) {
        setListing(null);

        setMedia([]);

        setErrorMessage("ID jasa tidak valid.");

        setLoading(false);

        return;
      }

      try {
        const [nextListing, nextMedia] = await Promise.all([
          getMyServiceListingDetailService({
            listingId: normalizedListingId,
          }),

          getMyServiceListingMediaService(normalizedListingId),
        ]);

        if (cancelled) {
          return;
        }

        if (!nextListing) {
          setListing(null);

          setMedia([]);

          setErrorMessage(
            "Jasa tidak ditemukan atau Anda tidak memiliki akses ke jasa ini.",
          );

          return;
        }

        setListing(nextListing);

        setMedia(nextMedia);

        replaceValues(createServiceListingFormValuesFromListing(nextListing));
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("LOAD SERVICE LISTING EDIT ERROR:", error);

        setErrorMessage(
          error instanceof Error ? error.message : "Gagal memuat jasa.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadListing();

    return () => {
      cancelled = true;
    };
  }, [normalizedListingId, replaceValues]);

  const editingDisabled =
    listing?.status === ServiceListingStatus.BLOCKED ||
    listing?.status === ServiceListingStatus.ARCHIVED;

  const hasUnsavedChanges =
    listing !== null &&
    !areServiceListingFormValuesEqual(
      form.values,
      createServiceListingFormValuesFromListing(
        listing,
     ),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !listing ||
      !normalizedListingId ||
      saving ||
      mediaBusy ||
      editingDisabled
    ) {
      return;
    }

    setSaving(true);

    setErrorMessage(null);

    setSuccessMessage(null);

    try {
      const editableFields = createServiceListingEditableFieldsFromForm(
        form.values,
      );

      await updateServiceListingService({
        listingId: normalizedListingId,

        ...editableFields,
      });

      const refreshedListing = await getMyServiceListingDetailService({
        listingId: normalizedListingId,
      });

      if (refreshedListing) {
        setListing(refreshedListing);

        replaceValues(
          createServiceListingFormValuesFromListing(refreshedListing),
        );
      }

      setSuccessMessage("Perubahan jasa berhasil disimpan.");
    } catch (error) {
      console.error("UPDATE SERVICE LISTING ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan perubahan jasa.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function runMediaMutation(
    operation: (currentListingId: string) => Promise<void>,
  ) {
    if (
      !listing ||
      !normalizedListingId ||
      mediaBusy ||
      saving ||
      editingDisabled
    ) {
      return;
    }

    const currentListingId = normalizedListingId;

    setMediaBusy(true);

    setErrorMessage(null);

    setSuccessMessage(null);

    try {
      await operation(currentListingId);

      await refreshMedia();
    } catch (error) {
      console.error("SERVICE LISTING MEDIA MUTATION ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui gambar jasa.",
      );
    } finally {
      setMediaBusy(false);
    }
  }

  function handleUploadCover(file: File) {
    void runMediaMutation(async (currentListingId) => {
      await uploadServiceListingCoverClient(currentListingId, file);
    });
  }

  function handleUploadPortfolio(file: File) {
    void runMediaMutation(async (currentListingId) => {
      await uploadServiceListingPortfolioImageClient(currentListingId, file);
    });
  }

  function handleDeleteImage(imageId: string) {
    void runMediaMutation(async (currentListingId) => {
      await deleteServiceListingImageClient(currentListingId, imageId);
    });
  }

  function handleBack() {
    if (saving || mediaBusy) {
      return;
    }

    router.back();
  }

  return {
    listing,

    values: form.values,

    media,

    loading,

    saving,

    mediaBusy,

    editingDisabled,

    hasUnsavedChanges,

    errorMessage,

    successMessage,

    onBack: handleBack,

    onPreview: handlePreview,

    onSubmit: handleSubmit,

    onUploadCover: handleUploadCover,

    onUploadPortfolio: handleUploadPortfolio,

    onDeleteImage: handleDeleteImage,

    onTitleChange: form.onTitleChange,

    onCategoryChange: form.onCategoryChange,

    onDescriptionChange: form.onDescriptionChange,

    onDeliverablesChange: form.onDeliverablesChange,

    onCustomerPreparationChange: form.onCustomerPreparationChange,

    onPriceFromChange: form.onPriceFromChange,

    onNegotiableChange: form.onNegotiableChange,

    onServiceModeChange: form.onServiceModeChange,

    onLocationNameChange: form.onLocationNameChange,
  };

  function handlePreview() {
  if (
    !normalizedListingId ||
    saving ||
    mediaBusy
  ) {
    return;
  }

  if (
    hasUnsavedChanges
  ) {
    setSuccessMessage(
      null,
    );

    setErrorMessage(
      "Simpan perubahan terlebih dahulu sebelum membuka preview agar preview menampilkan versi terbaru.",
    );

    return;
  }

  router.push(
    `/my-services/${encodeURIComponent(
      normalizedListingId,
    )}/preview`,
  );
 }
}