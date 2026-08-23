import type { LucideIcon } from "lucide-react";

export interface AdminNavigationItem {

    id: string;

    label: string;

    description: string;

    href: string;

    icon: LucideIcon;

    enabled: boolean;

    showOnDashboard: boolean;

}