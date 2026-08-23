"use client";

import Link from "next/link";

interface Props {
  isPublicProfile?: boolean;
  role?: string | null;
}

export default function DesktopQuickActions({
  isPublicProfile = false,
  role,
}: Props) {
  if (isPublicProfile) return null;

  const actions = [
    {
      title: "Riwayat Task",
      subtitle: "Lihat seluruh aktivitas task",
      href: "/history",
      icon: "📋",
    },
    {
      title: "Verifikasi",
      subtitle: "Upgrade akun menjadi Verified",
      href: "/profile/verification",
      icon: "🛡️",
    },
    {
      title: "Pembayaran",
      subtitle: "Kelola rekening & e-wallet",
      href: "/payment-method",
      icon: "💳",
    },
    {
      title: "Pengaturan",
      subtitle: "Privasi dan preferensi akun",
      href: "/settings",
      icon: "⚙️",
    },
    {
      title: "Semua Review",
      subtitle: "Lihat seluruh review pengguna",
      href: "/profile/reviews",
      icon: "⭐",
    },
  ];

  return (
    <section
      className="
        rounded-xl
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-slate-500">Kelola akun dan aktivitasmu.</p>
        </div>
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-5
          gap-5
        "
      >
        {actions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="
              group
              rounded-3xl
              border
              border-indigo-200
              bg-indigo-50
              text-lg
              text-indigo-600
              p-5
              transition-all
              hover:-translate-y-1
              hover:border-indigo-300
              hover:bg-indigo-50
              hover:shadow-lg
            "
          >
            <div className="text-xl">{item.icon}</div>

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
          </Link>
        ))}

        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="
              group
              rounded-2xl
              bg-slate-900
              p-5
              text-white
              transition-all
              hover:-translate-y-1
              hover:bg-slate-800
            "
          >
            <div className="text-3xl">🛠</div>

            <h3
              className="
                mt-5
                text-lg
                font-bold
              "
            >
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
          </Link>
        )}
      </div>
    </section>
  );
}