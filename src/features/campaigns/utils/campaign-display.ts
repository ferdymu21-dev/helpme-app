import type {
  CampaignTargetValue,
} from "../constants/campaign-target";

import {
  CampaignTarget,
} from "../constants/campaign-target";

const CAMPAIGN_TARGET_LABELS: Record<
  CampaignTargetValue,
  string
> = {
  [CampaignTarget.ALL]:
    "Semua Pengguna",

  [CampaignTarget.USER]:
    "Pengguna",

  [CampaignTarget.HELPER]:
    "Helper",

  [CampaignTarget.VERIFIED]:
    "Terverifikasi",

  [CampaignTarget.UNVERIFIED]:
    "Belum Terverifikasi",

  [CampaignTarget.CITY]:
    "Berdasarkan Kota",

  [CampaignTarget.RADIUS]:
    "Berdasarkan Radius",
};

const SPECIAL_ENUM_LABELS: Record<
  string,
  string
> = {
  INFO: "Informasi",

  INFO_BROADCAST:
    "Broadcast Informasi",
};

export function formatCampaignTarget(
  value: CampaignTargetValue,
) {
  return (
    CAMPAIGN_TARGET_LABELS[value] ??
    value
  );
}

export function formatCampaignEnumLabel(
  value: string,
) {
  if (SPECIAL_ENUM_LABELS[value]) {
    return SPECIAL_ENUM_LABELS[value];
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (item) =>
        item.charAt(0).toUpperCase() +
        item.slice(1),
    )
    .join(" ");
}

export function formatCampaignDateWib(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "-";
  }

  return `${new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date)} WIB`;
}

export function formatCampaignPercent(
  value: number,
) {
  return value.toLocaleString(
    "id-ID",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}