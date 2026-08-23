"use client";

import { AdminNavigation } from "../../constants/admin-navigation";

import { usePathname } from "next/navigation";

interface Props {
  title?: string;

  description?: string;
}

export default function AdminHeader({
  title,

  description,
}: Props) {
  const pathname = usePathname();

  const navigation = AdminNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const pageTitle = title ?? navigation?.label ?? "Dashboard";

  const pageDescription =
    description ?? navigation?.description ?? "HelpMe Admin Panel";

  return (
    <header
      className="
                border-b
                border-slate-200
                bg-white
                px-8
                py-6
            "
    >
      <h1
        className="
                    text-3xl
                    font-black
                    text-slate-900
                "
      >
        {pageTitle}
      </h1>

      <p
        className="
                    mt-2
                    text-sm
                    text-slate-500
                "
      >
        {pageDescription}
      </p>
    </header>
  );
}