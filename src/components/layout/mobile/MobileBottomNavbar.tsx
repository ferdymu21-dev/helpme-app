"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const menus = [
  {
    href: "/home",
    label: "Home",
    icon: "🏠",
  },

  {
    href: "/my-tasks",
    label: "Task",
    icon: "📋",
  },

  {
    href: "/tasks/create",
    label: "Create",
    icon: "➕",
    primary: true,
  },

  {
    href: "/messages",
    label: "Chat",
    icon: "💬",
  },  

  {
    href: "/profile",
    label: "Profile",
    icon: "👤",
  },
];

export default function MobileBottomNavbar() {
  const pathname = usePathname();

  return (
    <div
      className="
        fixed
        bottom-4
        left-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-md
        -translate-x-1/2
        rounded-[28px]
        border
        border-slate-200
        bg-white/90
        p-2
        shadow-[0_20px_50px_rgba(15,23,42,0.12)]
        backdrop-blur
        md:hidden
      "
    >

      <div className="grid grid-cols-5 gap-2">

        {menus.map((menu) => {
          const active =
            pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                py-3
                transition

                ${
                  menu.primary
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }
              `}
            >

              <span className="text-lg">
                {menu.icon}
              </span>

              <span
                className="
                  mt-1
                  text-[11px]
                  font-semibold
                "
              >
                {menu.label}
              </span>

            </Link>
          );
        })}

      </div>

    </div>
  );
}