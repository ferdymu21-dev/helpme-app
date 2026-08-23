"use client";

import Link from "next/link";

import type { AdminNavigationItem } from "../../types/admin-navigation.types";

interface Props {
  item: AdminNavigationItem;
}

export default function AdminDashboardCard({ item }: Props) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="
                rounded-3xl
                bg-white
                p-6
                shadow-sm
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
            "
    >
      <div
        className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-50
                    text-indigo-600
                "
      >
        <Icon size={28} />
      </div>

      <h2
        className="
                    mt-5
                    text-lg
                    font-bold
                    text-slate-900
                "
      >
        {item.label}
      </h2>

      <p
        className="
                    mt-2
                    text-sm
                    text-slate-500
                "
      >
        {item.description}
      </p>
    </Link>
  );
}