"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  SERVICE_CATEGORY_VALUES,
} from "../constants/service-categories";

import type {
  ServiceModeValue,
} from "../constants/service-mode";

import type {
  ServiceListingFormValues,
} from "../types/service-listing-form.types";

import {
  createEmptyServiceListingFormValues,
} from "../utils/service-listing-form";

export function useServiceListingForm(
  initialValues:
    ServiceListingFormValues =
      createEmptyServiceListingFormValues(),
) {
  const [
    values,
    setValues,
  ] =
    useState<ServiceListingFormValues>(
      initialValues,
    );

  const replaceValues =
  useCallback(
    (
      nextValues:
        ServiceListingFormValues,
    ) => {
      setValues(
        nextValues,
      );
    },
    [],
  );

  function setTitle(
    title: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        title,
      }),
    );
  }

  function setCategory(
    category: string,
  ) {
    setValues(
      (current) => ({
        ...current,

        category,

        customCategory:
          category ===
          SERVICE_CATEGORY_VALUES.OTHER
            ? current.customCategory
            : "",
      }),
    );
  }

  function setCustomCategory(
    customCategory: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        customCategory,
      }),
    );
  }

  function setDescription(
    description: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        description,
      }),
    );
  }

  function setDeliverables(
    deliverables: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        deliverables,
      }),
    );
  }

  function setCustomerPreparation(
    customerPreparation:
      string,
  ) {
    setValues(
      (current) => ({
        ...current,
        customerPreparation,
      }),
    );
  }

  function setPriceFrom(
    priceFrom: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        priceFrom,
      }),
    );
  }

  function setIsNegotiable(
    isNegotiable: boolean,
  ) {
    setValues(
      (current) => ({
        ...current,
        isNegotiable,
      }),
    );
  }

  function setServiceMode(
    serviceMode:
      ServiceModeValue,
  ) {
    setValues(
      (current) => ({
        ...current,
        serviceMode,
      }),
    );
  }

  function setLocationName(
    locationName: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        locationName,
      }),
    );
  }

  function resetForm() {
    setValues(
      createEmptyServiceListingFormValues(),
    );
  }

  return {
    values,

    replaceValues,

    resetForm,

    onTitleChange:
      setTitle,

    onCategoryChange:
      setCategory,

    onCustomCategoryChange:
      setCustomCategory,

    onDescriptionChange:
      setDescription,

    onDeliverablesChange:
      setDeliverables,

    onCustomerPreparationChange:
      setCustomerPreparation,

    onPriceFromChange:
      setPriceFrom,

    onNegotiableChange:
      setIsNegotiable,

    onServiceModeChange:
      setServiceMode,

    onLocationNameChange:
      setLocationName,
  };
}