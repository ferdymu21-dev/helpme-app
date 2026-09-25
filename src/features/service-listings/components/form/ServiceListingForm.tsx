"use client";

import type {
  FormEvent,
} from "react";

import type {
  ServiceModeValue,
} from "../../constants/service-mode";

import type {
  ServiceListingFormValues,
} from "../../types/service-listing-form.types";

import type {
  ProviderServiceListingMedia,
} from "../../types/service-listing-media.types";

import BasicInformationSection from "./BasicInformationSection";
import DeliverablesSection from "./DeliverablesSection";
import MediaSection from "./MediaSection";
import PricingSection from "./PricingSection";
import ServiceListingActionBar from "./ServiceListingActionBar";
import ServiceModeSection from "./ServiceModeSection";

interface ServiceListingFormProps {
  formId: string;

  values:
    ServiceListingFormValues;

  loading: boolean;

  disabled?: boolean;

  submitLabel: string;

  loadingLabel: string;

  media:
    ProviderServiceListingMedia[];

  mediaEnabled: boolean;

  mediaBusy: boolean;

  onTitleChange:
    (value: string) => void;

  onCategoryChange:
    (value: string) => void;

  onCustomCategoryChange:
    (value: string) => void;

  onDescriptionChange:
    (value: string) => void;

  onDeliverablesChange:
    (value: string) => void;

  onCustomerPreparationChange:
    (value: string) => void;

  onPriceFromChange:
    (value: string) => void;

  onNegotiableChange:
    (value: boolean) => void;

  onServiceModeChange:
    (value: ServiceModeValue) => void;

  onLocationNameChange:
    (value: string) => void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>,
    ) => void;

  onUploadCover:
    (file: File) => void;

  onUploadPortfolio:
    (file: File) => void;

  onDeleteImage:
    (imageId: string) => void;

  previewLabel?: string;

  onPreview?: () => void;
}

export default function ServiceListingForm({
  formId,
  values,
  loading,
  disabled = false,
  submitLabel,
  loadingLabel,
  media,
  mediaEnabled,
  mediaBusy,
  onTitleChange,
  onCategoryChange,
  onCustomCategoryChange,
  onDescriptionChange,
  onDeliverablesChange,
  onCustomerPreparationChange,
  onPriceFromChange,
  onNegotiableChange,
  onServiceModeChange,
  onLocationNameChange,
  onSubmit,
  onUploadCover,
  onUploadPortfolio,
  onDeleteImage,
  previewLabel,
  onPreview,
}: ServiceListingFormProps) {
  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="
        space-y-4
        px-4
        pb-28
        sm:px-6
        sm:pb-12
      "
    >
      <fieldset
        disabled={
          disabled ||
          loading ||
          mediaBusy
        }
        className="space-y-4"
      >
        <BasicInformationSection
          title={values.title}
          category={values.category}
          customCategory={
            values.customCategory
          }
          description={values.description}
          onTitleChange={onTitleChange}
          onCategoryChange={onCategoryChange}
          onCustomCategoryChange={
            onCustomCategoryChange
          }
          onDescriptionChange={
            onDescriptionChange
          }
        />

        <ServiceModeSection
          serviceMode={
            values.serviceMode
          }
          locationName={
            values.locationName
          }
          onServiceModeChange={
            onServiceModeChange
          }
          onLocationNameChange={
            onLocationNameChange
          }
        />

        <PricingSection
          priceFrom={
            values.priceFrom
          }
          isNegotiable={
            values.isNegotiable
          }
          onPriceFromChange={
            onPriceFromChange
          }
          onNegotiableChange={
            onNegotiableChange
          }
        />

        <DeliverablesSection
          deliverables={
            values.deliverables
          }
          customerPreparation={
            values.customerPreparation
          }
          onDeliverablesChange={
            onDeliverablesChange
          }
          onCustomerPreparationChange={
            onCustomerPreparationChange
          }
        />

        <MediaSection
          media={media}
          enabled={mediaEnabled}
          disabled={disabled}
          busy={mediaBusy}
          onUploadCover={
            onUploadCover
          }
          onUploadPortfolio={
            onUploadPortfolio
          }
          onDeleteImage={
            onDeleteImage
          }
        />
      </fieldset>

      <ServiceListingActionBar
        formId={formId}
        loading={loading}
        disabled={
          disabled ||
          mediaBusy
        }
        previewDisabled={
          mediaBusy
        }
        submitLabel={submitLabel}
        loadingLabel={loadingLabel}
        previewLabel={previewLabel}
        onPreview={onPreview}
      />
    </form>
  );
}