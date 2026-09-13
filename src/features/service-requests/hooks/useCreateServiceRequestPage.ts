"use client";

import { useMemo, useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { ServiceMode } from "@/features/service-listings/constants/service-mode";

import { usePublicServiceListingDetail } from "@/features/service-listings/hooks/usePublicServiceListingDetail";

import { createServiceRequestService } from "../services/create-service-request.service";

import type {
  CreateServiceRequestFormValues,
  ServiceRequestMode,
} from "../types/service-request.types";

interface ServiceModeChoice {
  listingId: string;

  value: ServiceRequestMode | "";
}

export function useCreateServiceRequestPage(listingId: string) {
  const router = useRouter();

  const listingState = usePublicServiceListingDetail(listingId);

  const [requestDescription, setRequestDescription] = useState("");

  const [neededAt, setNeededAt] = useState("");

  const [modeChoice, setModeChoice] = useState<ServiceModeChoice>({
    listingId: "",
    value: "",
  });

  const [locationName, setLocationName] = useState("");

  const [budget, setBudget] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<
    string | null
  >(null);

  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const selectedMode = useMemo<ServiceRequestMode | "">(() => {
    const listing = listingState.listing;

    if (!listing) {
      return "";
    }

    if (listing.serviceMode === ServiceMode.ONLINE) {
      return ServiceMode.ONLINE;
    }

    if (listing.serviceMode === ServiceMode.OFFLINE) {
      return ServiceMode.OFFLINE;
    }

    if (modeChoice.listingId !== listing.id) {
      return "";
    }

    return modeChoice.value;
  }, [listingState.listing, modeChoice]);

  function handleModeChange(mode: ServiceRequestMode) {
    const listing = listingState.listing;

    if (!listing || listing.serviceMode !== ServiceMode.BOTH || submitting) {
      return;
    }

    setModeChoice({
      listingId: listing.id,

      value: mode,
    });

    if (mode === ServiceMode.ONLINE) {
      setLocationName("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || createdRequestId) {
      return;
    }

    const listing = listingState.listing;

    if (!listing) {
      setSubmissionErrorMessage("Jasa tidak tersedia.");

      return;
    }

    const values: CreateServiceRequestFormValues = {
      requestDescription,

      neededAt,

      serviceMode: selectedMode,

      locationName,

      budget,
    };

    setSubmissionErrorMessage(null);

    setSubmitting(true);

    try {
      const result = await createServiceRequestService(listing.id, values);

      setCreatedRequestId(result.requestId);
    } catch (error) {
      console.error("CREATE SERVICE REQUEST ERROR:", error);

      setSubmissionErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan jasa belum dapat dikirim.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (submitting) {
      return;
    }

    router.push(`/services/${encodeURIComponent(listingId)}`);
  }

  const { errorMessage: listingErrorMessage, ...listingViewState } =
    listingState;

  return {
    ...listingViewState,

    listingErrorMessage,

    requestDescription,

    neededAt,

    selectedMode,

    locationName,

    budget,

    submitting,

    submissionErrorMessage,

    createdRequestId,

    onRequestDescriptionChange: setRequestDescription,

    onNeededAtChange: setNeededAt,

    onModeChange: handleModeChange,

    onLocationNameChange: setLocationName,

    onBudgetChange: setBudget,

    onSubmit: handleSubmit,

    onBack: handleBack,
  };
}
