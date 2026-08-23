"use client";

import Link from "next/link";

import Image from "next/image";

import {
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface Props {
  isPublicProfile?: boolean;
  role?: string | null;
}

interface QuickAction {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export default function DesktopQuickActions({
  isPublicProfile = false,
  role,
}: Props) {
  if (isPublicProfile) {
    return null;
  }

  const actions: QuickAction[] = [
    {
      title: "Riwayat Task",
      subtitle:
        "Lihat seluruh aktivitas task",
      href: "/history",
      icon: "/icons/profile/riwayat-task.svg",
    },
    {
      title: "Verifikasi",
      subtitle:
        "Upgrade akun menjadi Verified",
      href: "/profile/verification",
      icon: "/icons/profile/verifikasi-akun.svg",
    },
    {
      title: "Pembayaran",
      subtitle:
        "Kelola history pembayaran",
      href: "/payments/history",
      icon: "/icons/profile/payment.svg",
    },
    {
      title: "Pengaturan",
      subtitle:
        "Privasi dan preferensi akun",
      href: "/settings",
      icon: "/icons/profile/pengaturan.svg",
    },
    {
      title: "Semua Review",
      subtitle:
        "Lihat seluruh review pengguna",
      href: "/profile/reviews",
      icon: "/icons/profile/review.svg",
    },
  ];

  return (
    <section
      className="
        rounded-3xl
        bg-white
        p-6
        shadow-[0_10px_30px_rgba(15,23,42,.05)]
      "
    >
      {/* HEADER */}
      <div>
        <h2
          className="
            text-xl
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Akses Cepat
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Kelola akun dan aktivitasmu.
        </p>
      </div>

      {/* ACTION GRID */}
      <div
        className="
          mt-5
          grid
          grid-cols-5
          gap-4
        "
      >
        {actions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="
              group
              flex
              min-h-48
              flex-col
              rounded-3xl
              border
              border-indigo-100
              bg-indigo-50/70
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:shadow-lg
            "
          >
            {/* ICON */}
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-sm
              "
            >
              <Image
                src={item.icon}
                alt={item.title}
                width={24}
                height={24}
              />
            </div>

            {/* TEXT */}
            <h3
              className="
                mt-5
                text-base
                font-bold
                text-slate-900
              "
            >
              {item.title}
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              {item.subtitle}
            </p>

            {/* ARROW */}
            <div className="mt-auto flex justify-end pt-4">
              <ChevronRight
                className="
                  h-5
                  w-5
                  text-slate-400
                  transition
                  group-hover:translate-x-1
                  group-hover:text-indigo-600
                "
              />
            </div>
          </Link>
        ))}

        {/* ADMIN */}
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="
              group
              flex
              min-h-48
              flex-col
              rounded-3xl
              bg-slate-900
              p-5
              text-white
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-slate-800
              hover:shadow-lg
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/10
              "
            >
              <LayoutDashboard
                className="h-6 w-6"
              />
            </div>

            <h3 className="mt-5 text-base font-bold">
              Admin Dashboard
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-300
              "
            >
              Kelola seluruh sistem aplikasi.
            </p>

            <div className="mt-auto flex justify-end pt-4">
              <ChevronRight
                className="
                  h-5
                  w-5
                  text-slate-400
                  transition
                  group-hover:translate-x-1
                  group-hover:text-white
                "
              />
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}