import { ServiceMode } from "@/features/service-listings/constants/service-mode";

import type {
  CreateServiceRequestFormValues,
  CreateServiceRequestInput,
  ServiceRequestMode,
} from "../types/service-request.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeListingId(value: string): string {
  const normalized = value.trim();

  if (!UUID_PATTERN.test(normalized)) {
    throw new Error("Identitas jasa tidak valid.");
  }

  return normalized;
}

function normalizeNeededAt(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Waktu kebutuhan jasa wajib diisi.");
  }

  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    throw new Error("Waktu kebutuhan jasa tidak valid.");
  }

  return new Date(timestamp).toISOString();
}

function normalizeMode(
  value: CreateServiceRequestFormValues["serviceMode"],
): ServiceRequestMode {
  if (value !== ServiceMode.ONLINE && value !== ServiceMode.OFFLINE) {
    throw new Error("Pilih cara pelaksanaan jasa.");
  }

  return value;
}

function normalizeBudget(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error("Budget harus berupa angka.");
  }

  const budget = Number(normalized);

  if (!Number.isSafeInteger(budget) || budget <= 0) {
    throw new Error("Budget harus lebih dari Rp0.");
  }

  return budget;
}

export function validateAndNormalizeServiceRequestCreate(
  listingId: string,
  values: CreateServiceRequestFormValues,
): CreateServiceRequestInput {
  const requestDescription = values.requestDescription.trim();

  if (!requestDescription) {
    throw new Error("Deskripsi kebutuhan wajib diisi.");
  }

  const serviceMode = normalizeMode(values.serviceMode);

  const locationName = values.locationName.trim();

  if (serviceMode === ServiceMode.OFFLINE && !locationName) {
    throw new Error("Lokasi wajib diisi untuk jasa offline.");
  }

  return {
    listingId: normalizeListingId(listingId),

    requestDescription,

    neededAt: normalizeNeededAt(values.neededAt),

    serviceMode,

    locationName: serviceMode === ServiceMode.OFFLINE ? locationName : null,

    budget: normalizeBudget(values.budget),
  };
}
