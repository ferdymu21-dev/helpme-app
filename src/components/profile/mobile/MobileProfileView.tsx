"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { SignOut } from "@phosphor-icons/react";

import { logout } from "@/features/auth/services/auth.service";

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

export default function MobileProfileView({
  profile,
  profileUserId,
  isPublicProfile = false,
}: Props) {
  const [showReportModal, setShowReportModal] = useState(false);

  async function handleLogout() {
    const confirmLogout = confirm("Keluar dari akun?");

    if (!confirmLogout) return;

    try {
      await logout();

      window.location.href = "/login";
    } catch (error) {
      console.error(error);

      alert("Gagal logout");
    }
  }

  return (
    <main className="bg-slate-50 pb-32 lg:hidden">
      {/* CONTAINER */}
      <div className="px-6 py-7">
        {/* PROFILE CARD */}
        <div
          className="
            rounded-3xl
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
          "
        >
          {/* TOP */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="
      h-17
      w-17
      rounded-full
      object-cover
    "
                />
              ) : (
                <div
                  className="
      flex
      h-17
      w-17
      items-center
      justify-center
      rounded-full
      bg-indigo-100
      text-2xl
      font-black
      text-indigo-700
    "
                >
                  {profile.initials}
                </div>
              )}

              {/* INFO */}
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="
                    text-sm
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                  >
                    {profile.fullName}
                  </h1>
                </div>

                <p
                  className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
                >
                  {profile.username}
                </p>

                {profile.bio ? (
                  <p
                    className="
      mt-1
      text-xs
      leading-3.5
      text-slate-500
    "
                  >
                    {profile.bio}
                  </p>
                ) : (
                  <p
                    className="
      mt-1
      text-[9px]
      leading-3
      text-slate-500
    "
                  >
                    Helper aktif yang siap membantu task harianmu.
                  </p>
                )}

                {profile.location && (
                  <div
                    className="
      mt-1
      text-[8px]
      font-medium
      text-slate-500
    "
                  >
                    📍 {profile.location}
                  </div>
                )}

                {/* BADGES */}
                <div
                  className="
    mt-3
    flex
    gap-1
    overflow-x-auto
    pb-1
    scrollbar-hide
  "
                >
                  {(profile.badges || []).map((badge, index) => (
                    <div
                      key={index}
                      className={`
          shrink-0
          rounded-full
          px-2
          py-1.5
          text-[8px]
          font-bold
          whitespace-nowrap

          ${badge.className}
        `}
                    >
                      {badge.icon} {badge.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!isPublicProfile && (
              <button
                onClick={handleLogout}
                className="
      flex
      h-11
      w-11
      items-center
      justify-center
      rounded-2xl
      border
      border-slate-200
      bg-slate-50
      text-slate-600
      transition
      active:scale-95
    "
              >
                <SignOut size={15} weight="bold" />
              </button>
            )}
          </div>

          {/* STATS */}
          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-3
            "
          >
            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <p
                className="text-xs font-medium text-slate-500">
                Rating
              </p>

              <div
                className="mt-2 flex items-center gap-2">
                <Image
                  src="/icons/profile/star.svg"
                  alt="Rating"
                  width={18}
                  height={18}
                />

                <span
                  className="
      text-base
      font-black
      text-slate-900
    "
                >
                  {profile.averageRating}
                </span>
              </div>
            </div>

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <p
                className="
    text-xs
    font-medium
    text-slate-500
  "
              >
                Selesai
              </p>

              <div
                className="
    mt-2
    flex
    items-center
    gap-2
  "
              >
                <Image
                  src="/icons/profile/selesai.svg"
                  alt="Completed"
                  width={18}
                  height={18}
                />

                <span
                  className="
      text-base
      font-black
      text-slate-900
    "
                >
                  {profile.completedTasks}
                </span>
              </div>
            </div>

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <p
                className="
    text-xs
    font-medium
    text-slate-500
  "
              >
                Reviews
              </p>

              <div
                className="
    mt-2
    flex
    items-center
    gap-2
  "
              >
                <Image
                  src="/icons/profile/review.svg"
                  alt="Reviews"
                  width={18}
                  height={18}
                />

                <span
                  className="
      text-base
      font-black
      text-slate-900
    "
                >
                  {profile.totalReviews}
                </span>
              </div>
            </div>
          </div>

          {/* BUTTON */}

          {!isPublicProfile ? (
            <Link
              href="/profile/edit"
              className="
    mt-3
    flex
    h-9
    items-center
    justify-center
    rounded-2xl
    bg-indigo-500
    text-xs
    font-semibold
    text-white
  "
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/profile/edit-profile.svg"
                  alt="Edit Profile"
                  width={14}
                  height={14}
                />

                <span>Edit Profile</span>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => setShowReportModal(true)}
              className="
    mt-6
    flex
    h-10
    items-center
    justify-center
    rounded-2xl
    bg-slate-100
    px-4
    text-[10px]
    font-semibold
    text-red-500
  "
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/profile/laporkan.svg"
                  alt="Report"
                  width={14}
                  height={14}
                />

                <span>Laporkan</span>
              </div>
            </button>
          )}
        </div>

        {/* MENU */}
        {!isPublicProfile && (
          <div className="mt-6 space-y-3">
            {[
              {
                label: "Riwayat Task",
                href: "/history",
                icon: "/icons/profile/riwayat-task.svg",
              },

              {
                label: "Verifikasi Akun",
                href: "/profile/verification",
                icon: "/icons/profile/verifikasi-akun.svg",
              },

              {
                label: "Riwayat Pembayaran",
                href: "/payments/history",
                icon: "/icons/profile/payment.svg",
              },

              {
                label: "Pengaturan",
                href: "/settings",
                icon: "/icons/profile/pengaturan.svg",
              },

              {
                label: "Lihat Semua Review",
                href: "/profile/reviews",
                icon: "/icons/profile/review.svg",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="
      flex
      w-full
      items-center
      justify-between
      rounded-2xl
      bg-white
      px-5
      py-4
      text-left
      shadow-sm
    "
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                  />

                  <span
                    className="
      text-sm
      font-semibold
      text-slate-700
    "
                  >
                    {item.label}
                  </span>
                </div>

                <span className="text-slate-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ReportUserModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={profileUserId || ""}
      />

      <MobileBottomNavbar />
    </main>
  );
}