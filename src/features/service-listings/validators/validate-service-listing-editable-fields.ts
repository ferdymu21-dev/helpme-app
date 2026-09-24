import {
  getCanonicalServiceCategory,
  SERVICE_CATEGORY_VALUES,
} from "../constants/service-categories";

import {
  ServiceMode,
} from "../constants/service-mode";

import type {
  ServiceModeValue,
} from "../constants/service-mode";

import type {
  ServiceListingEditableFields,
} from "../types/service-listing.types";

function normalizeRequiredText(
  value: unknown,
  fieldLabel: string,
): string {
  if (typeof value !== "string") {
    throw new Error(
      `${fieldLabel} tidak valid.`,
    );
  }

  const normalized =
    value.trim();

  if (normalized.length === 0) {
    throw new Error(
      `${fieldLabel} wajib diisi.`,
    );
  }

  return normalized;
}

function normalizeOptionalText(
  value: unknown,
  fieldLabel: string,
): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(
      `${fieldLabel} tidak valid.`,
    );
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizePriceFrom(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      "Harga mulai harus berupa bilangan bulat positif.",
    );
  }

  return value;
}

function normalizeIsNegotiable(
  value: unknown,
): boolean {
  if (typeof value !== "boolean") {
    throw new Error(
      "Status negosiasi harga tidak valid.",
    );
  }

  return value;
}

function normalizeServiceMode(
  value: unknown,
): ServiceModeValue {
  switch (value) {
    case ServiceMode.ONLINE:
      return ServiceMode.ONLINE;

    case ServiceMode.OFFLINE:
      return ServiceMode.OFFLINE;

    case ServiceMode.BOTH:
      return ServiceMode.BOTH;

    default:
      throw new Error(
        "Mode layanan tidak valid.",
      );
  }
}

/**
 * Shared validation for editable Service Listing fields.
 *
 * Both create and update must go through this function so
 * their application-level validation cannot drift.
 *
 * PostgreSQL remains the authoritative integrity boundary.
 */
export function validateAndNormalizeServiceListingEditableFields(
  payload: ServiceListingEditableFields,
): ServiceListingEditableFields {
  const title =
    normalizeRequiredText(
      payload.title,
      "Judul jasa",
    );

  const categoryInput =
    normalizeRequiredText(
      payload.category,
      "Kategori jasa",
    );

  const category =
    getCanonicalServiceCategory(
      categoryInput,
    );

  if (category === null) {
    throw new Error(
      "Kategori jasa tidak valid.",
    );
  }

  const customCategory =
    category ===
    SERVICE_CATEGORY_VALUES.OTHER
      ? normalizeRequiredText(
          payload.customCategory ??
            "",
          "Jenis jasa lainnya",
        )
      : null;

  const description =
    normalizeRequiredText(
      payload.description,
      "Deskripsi jasa",
    );

  const deliverables =
    normalizeRequiredText(
      payload.deliverables,
      "Hasil yang akan diberikan",
    );

  const customerPreparation =
    normalizeOptionalText(
      payload.customerPreparation,
      "Persiapan pelanggan",
    );

  const priceFrom =
    normalizePriceFrom(
      payload.priceFrom,
    );

  const isNegotiable =
    normalizeIsNegotiable(
      payload.isNegotiable,
    );

  const serviceMode =
    normalizeServiceMode(
      payload.serviceMode,
    );

  const locationName =
    normalizeOptionalText(
      payload.locationName,
      "Lokasi layanan",
    );

  if (
    (
      serviceMode ===
        ServiceMode.OFFLINE ||
      serviceMode ===
        ServiceMode.BOTH
    ) &&
    locationName === null
  ) {
    throw new Error(
      "Lokasi layanan wajib diisi untuk jasa offline.",
    );
  }

  return {
    title,

    category,

    customCategory,

    description,

    deliverables,

    customerPreparation,

    priceFrom,

    isNegotiable,

    serviceMode,

    locationName,
  };
}