import { ServiceMode } from "@/features/service-listings/constants/service-mode";

import {
  ServiceRequestStatus,
  type ServiceRequestStatusValue,
} from "../constants/service-request-status";

import type { ServiceRequestMode } from "../types/service-request.types";

export function getServiceRequestStatusLabel(
  status: ServiceRequestStatusValue,
): string {
  switch (status) {
    case ServiceRequestStatus.PENDING_PROVIDER:
      return "Menunggu Tanggapan";

    case ServiceRequestStatus.NEGOTIATING:
      return "Negosiasi";

    case ServiceRequestStatus.AGREEMENT_PENDING:
      return "Menunggu Kesepakatan";

    case ServiceRequestStatus.AGREED:
      return "Disepakati";

    case ServiceRequestStatus.IN_PROGRESS:
      return "Sedang Dikerjakan";

    case ServiceRequestStatus.SUBMITTED:
      return "Menunggu Konfirmasi";

    case ServiceRequestStatus.COMPLETED:
      return "Selesai";

    case ServiceRequestStatus.DECLINED:
      return "Ditolak";

    case ServiceRequestStatus.CANCELLED:
      return "Dibatalkan";
  }
}

export function getServiceRequestModeLabel(mode: ServiceRequestMode): string {
  return mode === ServiceMode.ONLINE ? "Online" : "Offline";
}

export function formatServiceRequestDateTime(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(timestamp);
}

export function formatServiceRequestBudget(value: number | null): string {
  if (value === null) {
    return "Budget belum ditentukan";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}
