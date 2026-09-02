"use client";

import Link from "next/link";

import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageSquareText,
  Settings,
} from "lucide-react";

interface Props {
  isPublicProfile?: boolean;
  role?: string | null;
}

const ACTIVITY_ACTIONS = [
  {
    title: "Riwayat Task",
    subtitle:
      "Lihat seluruh task yang pernah dijalankan.",
    href: "/history",
    icon: ClipboardList,
  },
  {
    title: "Riwayat Pembayaran",
    subtitle:
      "Pantau transaksi dan aktivitas pembayaran.",
    href: "/payments/history",
    icon: CreditCard,
  },
  {
    title: "Semua Review",
    subtitle:
      "Lihat seluruh ulasan yang diterima.",
    href: "/profile/reviews",
    icon: MessageSquareText,
  },
];

export default function DesktopQuickActions({
  isPublicProfile = false,
  role,
}: Props) {
  if (isPublicProfile) {
    return null;
  }

  return (
    <section className="space-y-5">
      {/* ACTIVITY */}
      <div>
        <div>
          <h2
            className="
              text-lg
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Aktivitas
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Pantau task, transaksi, dan reputasi akun Anda.
          </p>
        </div>

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-4
          "
        >
          {ACTIVITY_ACTIONS.map(
            (item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    group
                    flex
                    min-h-44
                    flex-col
                    rounded-[26px]
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_8px_24px_rgba(15,23,42,0.035)]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-indigo-200
                    hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-50
                      text-indigo-600
                      transition
                      group-hover:bg-indigo-100
                    "
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={2}
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      text-sm
                      font-black
                      text-slate-900
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-1.5
                      text-[11px]
                      leading-5
                      text-slate-500
                    "
                  >
                    {item.subtitle}
                  </p>

                  <ChevronRight
                    className="
                      mt-auto
                      ml-auto
                      h-4
                      w-4
                      text-slate-300
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-indigo-600
                    "
                  />
                </Link>
              );
            },
          )}
        </div>
      </div>

      {/* ACCOUNT */}
      <div
        className="
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-6
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-600
              "
            >
              <Settings
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Pengaturan Akun
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Kelola profil, verifikasi identitas, kata sandi, dan
                keamanan akun.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="
              inline-flex
              h-10
              shrink-0
              items-center
              gap-2
              rounded-xl
              bg-slate-900
              px-4
              text-xs
              font-bold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            Buka Pengaturan

            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ADMIN */}
      {role === "ADMIN" && (
        <Link
          href="/admin"
          className="
            group
            flex
            items-center
            justify-between
            gap-5
            rounded-[28px]
            bg-slate-950
            p-5
            text-white
            shadow-[0_12px_30px_rgba(15,23,42,0.16)]
            transition
            hover:bg-slate-900
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
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
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3
                className="
                  text-sm
                  font-black
                "
              >
                Admin Dashboard
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Kelola moderasi dan sistem HelpMe.
              </p>
            </div>
          </div>

          <ChevronRight
            className="
              h-5
              w-5
              text-slate-500
              transition
              group-hover:translate-x-1
              group-hover:text-white
            "
          />
        </Link>
      )}
    </section>
  );
}