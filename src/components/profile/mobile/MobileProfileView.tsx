"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Flag,
  MapPin,
  MessageSquareText,
  Pencil,
  Settings,
  Star,
} from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import ReportUserModal from "@/features/reports/components/ReportUserModal";

interface Props {
  profile: {
    fullName: string;

    username: string;

    avatarUrl: string;

    bio: string;

    location: string;

    initials: string;

    completedTasks: number;

    totalReviews: number;

    averageRating: string;

    badges: {
      label: string;

      icon: string;

      className: string;
    }[];
  };

  profileUserId?: string;

  isPublicProfile?: boolean;
}

const ACTIVITY_MENU = [
  {
    label: "Riwayat Task",
    description: "Lihat task yang pernah Anda jalankan",
    href: "/history",
    icon: ClipboardList,
  },
  {
    label: "Riwayat Pembayaran",
    description: "Lihat aktivitas dan riwayat transaksi",
    href: "/payments/history",
    icon: CreditCard,
  },
  {
    label: "Semua Review",
    description: "Lihat ulasan dari pengguna HelpMe",
    href: "/profile/reviews",
    icon: MessageSquareText,
  },
];

export default function MobileProfileView({
  profile,
  profileUserId,
  isPublicProfile = false,
}: Props) {
  const router = useRouter();

  const [showReportModal, setShowReportModal] = useState(false);

  const initials =
    profile.initials?.trim() ||
    profile.fullName?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <main
      className={`
        bg-slate-50
        lg:hidden

        ${
          isPublicProfile
            ? "pb-6"
            : "pb-32"
        }
      `}
    >
      <div className="px-5 pt-5">
        {/* HEADER */}
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali"
            title="Kembali"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              active:scale-95
            "
          >
            <ArrowLeft
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </button>

          <div className="min-w-0">
            <h1
              className="
                text-base
                font-black
                tracking-tight
                text-slate-900
              "
            >
              {isPublicProfile
                ? "Profil Pengguna"
                : "Profil Saya"}
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              {isPublicProfile
                ? "Informasi, reputasi, dan aktivitas pengguna"
                : "Kelola identitas dan aktivitas akun Anda"}
            </p>
          </div>
        </header>

        {/* PROFILE HERO */}
        <section
          className="
            mt-5
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-[0_12px_32px_rgba(15,23,42,0.05)]
          "
        >
          {/* DECORATIVE TOP */}
          <div
            className="
              h-20
              bg-linear-to-br
              from-indigo-100
              via-indigo-50
              to-violet-50
            "
          />

          {/* IDENTITY */}
          <div className="px-5 pb-5">
            <div className="-mt-12 flex flex-col items-center text-center">
              {/* AVATAR */}
              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-4
                  border-white
                  bg-indigo-100
                  text-2xl
                  font-black
                  text-indigo-700
                  shadow-[0_8px_24px_rgba(15,23,42,0.12)]
                "
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`Foto profil ${profile.fullName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <h2
                className="
                  mt-3
                  max-w-full
                  truncate
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                {profile.fullName || "Pengguna HelpMe"}
              </h2>

              {profile.username && (
                <p
                  className="mt-1 text-sm font-medium text-slate-500">
                  {profile.username}
                </p>
              )}

              {profile.location && (
                <div
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-600
                  "
                >
                  <MapPin
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                  />

                  {profile.location}
                </div>
              )}

              <p
                className="
                  mt-4
                  max-w-sm
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {profile.bio ||
                  "Helper aktif yang siap membantu berbagai kebutuhan harian di HelpMe."}
              </p>

              {/* PRIMARY ACTION */}
              {!isPublicProfile ? (
                <Link
                  href="/profile/edit"
                  className="
                    mt-5
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-indigo-600
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_8px_20px_rgba(79,70,229,0.2)]
                    transition
                    hover:bg-indigo-700
                    active:scale-[0.99]
                  "
                >
                  <Pencil
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />

                  Edit Profil
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setShowReportModal(true)
                  }
                  className="
                    mt-5
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    px-4
                    text-xs
                    font-bold
                    text-red-600
                    transition
                    hover:bg-red-100
                    active:scale-[0.98]
                  "
                >
                  <Flag
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                  />

                  Laporkan Pengguna
                </button>
              )}
            </div>

            {/* REPUTATION */}
            <div
              className="
                mt-6
                grid
                grid-cols-3
                divide-x
                divide-slate-100
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                px-1
                py-4
              "
            >
              <div className="flex flex-col items-center px-2 text-center">
                <Star
                  className="
                    h-4
                    w-4
                    fill-amber-400
                    text-amber-400
                  "
                />

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  {profile.averageRating}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                  Rating
                </p>
              </div>

              <div className="flex flex-col items-center px-2 text-center">
                <CheckCircle2
                  className="
                    h-4
                    w-4
                    text-emerald-600
                  "
                  strokeWidth={2.2}
                />

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  {profile.completedTasks}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                  Task Selesai
                </p>
              </div>

              <div className="flex flex-col items-center px-2 text-center">
                <MessageSquareText
                  className="
                    h-4
                    w-4
                    text-indigo-600
                  "
                  strokeWidth={2.1}
                />

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  {profile.totalReviews}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                  Review
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENT BADGES */}
        {profile.badges.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center gap-2">
              <Award
                className="h-4 w-4 text-indigo-600"
                strokeWidth={2.1}
              />

              <h2
                className="
                  text-xs
                  font-black
                  tracking-wide
                  text-slate-700
                  uppercase
                "
              >
                Pencapaian
              </h2>
            </div>

            <div
              className="
                mt-3
                flex
                gap-2
                overflow-x-auto
                pb-1
                scrollbar-hide
              "
            >
              {profile.badges.map((badge, index) => (
                <div
                  key={`${badge.label}-${index}`}
                  className={`
                    inline-flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    whitespace-nowrap

                    ${badge.className}
                  `}
                >
                  <span>{badge.icon}</span>

                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* OWNER MENU */}
{!isPublicProfile && (
  <>
    {/* ACTIVITY */}
    <section className="mt-6">
      <div className="px-1">
        <p
          className="
            text-xs
            font-black
            tracking-wide
            text-slate-500
            uppercase
          "
        >
          Aktivitas
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-slate-400
          "
        >
          Pantau task, transaksi, dan ulasan akun Anda.
        </p>
      </div>

      <div
        className="
          mt-3
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
        "
      >
        {ACTIVITY_MENU.map((item, index) => {
          const Icon = item.icon;

          const isLast =
            index === ACTIVITY_MENU.length - 1;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex
                items-center
                gap-3
                px-4
                py-4
                transition
                active:bg-slate-50

                ${
                  !isLast
                    ? "border-b border-slate-100"
                    : ""
                }
              `}
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Icon
                  className="h-4.5 w-4.5"
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    text-slate-400
                  "
                >
                  {item.description}
                </p>
              </div>

              <ChevronRight
                className="
                  h-4
                  w-4
                  shrink-0
                  text-slate-300
                "
                strokeWidth={2}
              />
            </Link>
          );
        })}
      </div>
    </section>

    {/* ACCOUNT */}
    <section className="mt-6">
      <div className="px-1">
        <p
          className="
            text-xs
            font-black
            tracking-wide
            text-slate-500
            uppercase
          "
        >
          Akun
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-slate-400
          "
        >
          Kelola identitas, keamanan, dan pengaturan akun.
        </p>
      </div>

      <Link
        href="/settings"
        className="
          mt-3
          flex
          items-center
          gap-3
          rounded-3xl
          border
          border-slate-200
          bg-white
          px-4
          py-4
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
          transition
          active:bg-slate-50
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-slate-100
            text-slate-600
          "
        >
          <Settings
            className="h-4.5 w-4.5"
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-sm
              font-bold
              text-slate-800
            "
          >
            Pengaturan
          </p>

          <p
            className="
              mt-0.5
              text-[10px]
              leading-4
              text-slate-400
            "
          >
            Edit profil, verifikasi, kata sandi, dan keamanan akun
          </p>
        </div>

        <ChevronRight
          className="
            h-4
            w-4
            shrink-0
            text-slate-300
          "
          strokeWidth={2}
        />
      </Link>
    </section>
  </>
)}
      </div>

      <ReportUserModal
        open={showReportModal}
        onClose={() =>
          setShowReportModal(false)
        }
        reportedUserId={
          profileUserId || ""
        }
      />

      <MobileBottomNavbar />
    </main>
  );
}