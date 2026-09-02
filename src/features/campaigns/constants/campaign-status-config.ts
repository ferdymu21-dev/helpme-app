import {
  CampaignStatus,
} from "./campaign-status";

export const CampaignStatusConfig = {
  [CampaignStatus.DRAFT]: {
    label: "Draft",

    color:
      "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",

    dot:
      "bg-slate-500",
  },

  [CampaignStatus.SCHEDULED]: {
    label: "Terjadwal",

    color:
      "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",

    dot:
      "bg-blue-500",
  },

  [CampaignStatus.PUBLISHED]: {
    label: "Dipublikasikan",

    color:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",

    dot:
      "bg-emerald-500",
  },

  [CampaignStatus.FINISHED]: {
    label: "Selesai",

    color:
      "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",

    dot:
      "bg-violet-500",
  },

  [CampaignStatus.CANCELLED]: {
    label: "Dibatalkan",

    color:
      "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",

    dot:
      "bg-rose-500",
  },
} as const;