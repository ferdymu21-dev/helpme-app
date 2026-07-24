import {
    Bell,
    CircleX,
    Handshake,
    Star,
    UserRoundPlus,
    CreditCard,
} from "lucide-react";

import type {
    LucideIcon,
} from "lucide-react";

import {
    NotificationCategory,
} from "../constants/notification-category";

export interface NotificationUIConfig {
    icon: LucideIcon;
    iconColor: string;
    backgroundColor: string;
    badge: string;
    badgeColor: string;
}

/* =========================
   BADGE CONFIG (CATEGORY)
========================= */

function getBadgeConfig(
    category: string,
) {

    switch (category) {

        case NotificationCategory.TASK:
            return {
                badge: "Task",
                badgeColor:
                    "bg-blue-100 text-blue-700",
            };

        case NotificationCategory.PAYMENT:
            return {
                badge: "Transaksi",
                badgeColor:
                    "bg-indigo-100 text-indigo-700",
            };

        case NotificationCategory.REVIEW:
            return {
                badge: "Review",
                badgeColor:
                    "bg-amber-100 text-amber-700",
            };

        case NotificationCategory.INFO:
            return {
                badge: "Info",
                badgeColor:
                    "bg-cyan-100 text-cyan-700",
            };

        case NotificationCategory.SYSTEM:
            return {
                badge: "System",
                badgeColor:
                    "bg-slate-200 text-slate-700",
            };

        default:
            return {
                badge: "Lainnya",
                badgeColor:
                    "bg-slate-100 text-slate-600",
            };

    }

}

/* =========================
   TYPE CONFIG
========================= */

export function getNotificationConfig(
    category: string,
    type: string,
): NotificationUIConfig {

    const badge =
        getBadgeConfig(category);

    switch (type) {

        /* =========================
           TASK
        ========================= */

        case "APPLY_TASK":
            return {
                icon: UserRoundPlus,
                iconColor: "text-blue-600",
                backgroundColor: "bg-blue-100",
                ...badge,
            };

        case "TASK_ACCEPTED":
            return {
                icon: Handshake,
                iconColor: "text-emerald-600",
                backgroundColor: "bg-emerald-100",
                ...badge,
            };

        case "TASK_CANCELLED":
            return {
                icon: CircleX,
                iconColor: "text-rose-600",
                backgroundColor: "bg-rose-100",
                ...badge,
            };

        /* =========================
           REVIEW
        ========================= */

        case "NEW_REVIEW":
            return {
                icon: Star,
                iconColor: "text-amber-500",
                backgroundColor: "bg-amber-100",
                ...badge,
            };

        /* =========================
           PAYMENT
        ========================= */

        case "DONATION_PAID":
        case "URGENT_TASK_PAID":
            return {
                icon: CreditCard,
                iconColor: "text-indigo-600",
                backgroundColor: "bg-indigo-100",
                ...badge,
            };

        case "DONATION_EXPIRED":
        case "URGENT_TASK_EXPIRED":
            return {
                icon: CreditCard,
                iconColor: "text-red-600",
                backgroundColor: "bg-red-100",
                ...badge,
            };

        /* =========================
           DEFAULT
        ========================= */

        default:
            return {
                icon: Bell,
                iconColor: "text-slate-600",
                backgroundColor: "bg-slate-100",
                ...badge,
            };

    }

}