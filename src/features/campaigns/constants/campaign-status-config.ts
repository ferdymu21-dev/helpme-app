import {
    CampaignStatus,
} from "./campaign-status";

export const CampaignStatusConfig = {

    [CampaignStatus.DRAFT]: {

        label: "Draft",

        color:
            "bg-slate-100 text-slate-700",

        dot:
            "bg-slate-500",

    },

    [CampaignStatus.SCHEDULED]: {

        label: "Scheduled",

        color:
            "bg-blue-100 text-blue-700",

        dot:
            "bg-blue-500",

    },

    [CampaignStatus.PUBLISHED]: {

        label: "Published",

        color:
            "bg-green-100 text-green-700",

        dot:
            "bg-green-500",

    },

    [CampaignStatus.FINISHED]: {

        label: "Finished",

        color:
            "bg-purple-100 text-purple-700",

        dot:
            "bg-purple-500",

    },

    [CampaignStatus.CANCELLED]: {

        label: "Cancelled",

        color:
            "bg-red-100 text-red-700",

        dot:
            "bg-red-500",

    },

} as const;