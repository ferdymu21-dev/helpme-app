"use client";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

const menus = [
  {
    label: "Home",
    href: "/home",
    icon: "🏠",
  },
  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: "📋",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: "💬",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "👤",
  },
];

export default function DesktopSidebar() {
  const pathname =
    usePathname();

  return (
    <aside
      className="
        hidden
        lg:flex
        fixed
        left-0
        top-0
        z-40
        h-screen
        w-70
        flex-col
        border-r
        border-slate-200
        bg-white
        px-6
        py-8
      "
    >

      {/* LOGO */}
      <div className="flex justify-center">

        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={140}
          height={140}
          className="h-auto w-45"
          priority
        />

     </div>

      {/* MENU */}
      <nav className="mt-10 flex-1 space-y-2">

        {menus.map((menu) => {
          const active =
            pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex
                items-center
                gap-4
                rounded-2xl
                px-5
                py-4
                text-sm
                font-semibold
                transition

                ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >

              <span className="text-lg">
                {menu.icon}
              </span>

              {menu.label}

            </Link>
          );
        })}

      </nav>

      {/* FOOTER */}
      <div
        className="
          rounded-3xl
          bg-linear-to-br
          from-indigo-600
          to-violet-600
          p-5
          text-white
        "
      >

        <p className="text-sm font-semibold">
          HelpMe Marketplace
        </p>

        <p className="mt-2 text-sm text-indigo-100">
          Bantu orang sekitar dan
          hasilkan uang dari skillmu.
        </p>

      </div>

    </aside>
  );
}