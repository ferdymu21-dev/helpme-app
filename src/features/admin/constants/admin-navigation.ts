import {
  BarChart3,
  ClipboardList,
  Flag,
  Home,
  Image,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import type { AdminNavigationItem } from "../types/admin-navigation.types";

export const AdminNavigation: AdminNavigationItem[] = [
  {
    id: "dashboard",

    label: "Dashboard",

    description: "Ringkasan sistem",

    href: "/admin",

    icon: Home,

    enabled: true,

    showOnDashboard: false,
  },

  {
    id: "verification",

    label: "Verification",

    description: "Kelola verifikasi akun",

    href: "/admin/verification",

    icon: ShieldCheck,

    enabled: true,

    showOnDashboard: true,
  },

  {
    id: "users",

    label: "Users",

    description: "Kelola seluruh pengguna",

    href: "/admin/users",

    icon: Users,

    enabled: true,

    showOnDashboard: true,
  },

  {
    id: "tasks",

    label: "Tasks",

    description: "Kelola seluruh task",

    href: "/admin/tasks",

    icon: ClipboardList,

    enabled: true,

    showOnDashboard: true,
  },

  {
    id: "reports",

    label: "Reports",

    description: "Kelola laporan pengguna",

    href: "/admin/reports",

    icon: Flag,

    enabled: true,

    showOnDashboard: true,
  },

  {
  id: "ads",

  label: "Ads",

  description: "Kelola iklan platform",

  href: "/admin/ads",

  icon: Image,

  enabled: true,

  showOnDashboard: true,
},

  {
    id: "campaigns",

    label: "Campaigns",

    description: "Broadcast & Promo",

    href: "/admin/campaigns",

    icon: Megaphone,

    enabled: true,

    showOnDashboard: true,
  },

  {
    id: "analytics",

    label: "Analytics",

    description: "Statistik platform",

    href: "/admin/analytics",

    icon: BarChart3,

    enabled: true,

    showOnDashboard: true,
  },

  {
    id: "payments",

    label: "Payments",

    description: "Kelola transaksi",

    href: "/admin/payments",

    icon: Wallet,

    enabled: false,

    showOnDashboard: true,
  },

  {
    id: "settings",

    label: "Settings",

    description: "Pengaturan sistem",

    href: "/admin/settings",

    icon: Settings,

    enabled: false,

    showOnDashboard: false,
  },
];