"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { AdminNavigation } from "../../constants/admin-navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
                hidden
                w-72
                shrink-0
                border-r
                border-slate-200
                bg-white
                lg:flex
                lg:flex-col
            "
    >
      {/* Logo */}

      <div
        className="
                    border-b
                    border-slate-200
                    px-6
                    py-6
                "
      >
        <h1
          className="
                        text-2xl
                        font-black
                        text-indigo-600
                    "
        >
          HelpMe
        </h1>

        <p
          className="
                        mt-1
                        text-sm
                        text-slate-500
                    "
        >
          Admin Panel
        </p>
      </div>

      {/* Navigation */}

      <nav
        className="
                    flex-1
                    overflow-y-auto
                    px-3
                    py-5
                "
      >
        <ul
          className="
                        space-y-1
                    "
        >
          {AdminNavigation.filter((item) => item.enabled)

            .map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={clsx(
                      `
                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                            font-medium
                                            transition-all
                                            duration-200
                                            `,

                      active
                        ? `
                                                  bg-indigo-50
                                                  text-indigo-600
                                                  shadow-sm
                                                  `
                        : `
                                                  text-slate-600
                                                  hover:bg-slate-100
                                                  hover:text-slate-900
                                                  `,
                    )}
                  >
                    <Icon size={18} />

                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Footer */}

      <footer
        className="
                    border-t
                    border-slate-200
                    p-5
                "
      >
        <p
          className="
                        text-xs
                        font-semibold
                        text-slate-500
                    "
        >
          HelpMe Admin
        </p>

        <p
          className="
                        mt-1
                        text-xs
                        text-slate-400
                    "
        >
          Version 1.0
        </p>
      </footer>
    </aside>
  );
}