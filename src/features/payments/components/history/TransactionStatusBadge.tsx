import {
    Ban,
    CircleCheck,
    CircleX,
    Clock3,
    ClockAlert,
} from "lucide-react";

import type {
    TransactionStatus,
} from "../../types/transaction";

interface Props {
    status: TransactionStatus;
}

const CONFIG = {
    PAID: {
        label: "Berhasil",
        icon: CircleCheck,
        style:
            "bg-emerald-50 text-emerald-700",
    },

    PENDING: {
        label: "Menunggu",
        icon: Clock3,
        style:
            "bg-amber-50 text-amber-700",
    },

    FAILED: {
        label: "Gagal",
        icon: CircleX,
        style:
            "bg-red-50 text-red-700",
    },

    EXPIRED: {
        label: "Kedaluwarsa",
        icon: ClockAlert,
        style:
            "bg-slate-100 text-slate-600",
    },

    CANCELLED: {
        label: "Dibatalkan",
        icon: Ban,
        style:
            "bg-slate-100 text-slate-600",
    },
} satisfies Record<
    TransactionStatus,
    {
        label: string;
        icon: typeof CircleCheck;
        style: string;
    }
>;

export default function TransactionStatusBadge({
    status,
}: Props) {
    const config =
        CONFIG[status];

    const Icon =
        config.icon;

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-semibold
                leading-none
                ${config.style}
            `}
        >
            <Icon
                size={11}
                strokeWidth={2.5}
            />

            {config.label}
        </span>
    );
}