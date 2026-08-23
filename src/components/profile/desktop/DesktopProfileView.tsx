"use client";

import {
  type ReactNode,
  useState,
} from "react";

import {
  BadgeCheck,
  UserRound,
} from "lucide-react";

import DesktopQuickActions from "./DesktopQuickActions";
import DesktopProfileSidebar from "./DesktopProfileSidebar";
import DesktopStatsCards from "./DesktopStatsCards";
import DesktopBadgeCard from "./DesktopBadgeCard";

import { useAuthStore } from "@/store/auth.store";

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

  /*
   * Digunakan khusus Public Profile
   * untuk menempatkan review tepat
   * di bawah Reputation Badge.
   */
  reviewSection?: ReactNode;
}

export default function DesktopProfileView({
  profile,
  profileUserId,
  isPublicProfile = false,
  reviewSection,
}: Props) {
  const [
    showReportModal,
    setShowReportModal,
  ] = useState(false);

  const role = useAuthStore(
    (state) => state.role,
  );

  return (
    <main
      className="
        hidden
        min-h-screen
        bg-slate-50
        lg:block
      "
    >
      {/* PAGE BACKGROUND */}
      <div
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-0
          h-96
          bg-linear-to-b
          from-indigo-50/70
          via-slate-50/60
          to-transparent
        "
      />

      {/* CONTAINER */}
      <div
        className="
          relative
          z-10
          mx-auto
          max-w-360
          px-8
          py-10
          xl:px-10
        "
      >
        {/* =========================
            PAGE HEADER
        ========================= */}
        <header
          className="
            mb-8
            flex
            items-end
            justify-between
            gap-8
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-indigo-100
                bg-white/80
                px-3.5
                py-2
                text-xs
                font-bold
                text-indigo-600
                shadow-sm
                backdrop-blur
              "
            >
              {isPublicProfile ? (
                <>
                  <UserRound
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  Profil Pengguna
                </>
              ) : (
                <>
                  <BadgeCheck
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  Profil Saya
                </>
              )}
            </div>

            <h1
              className="
                mt-4
                text-4xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              {isPublicProfile
                ? "Profil Pengguna"
                : "Kelola Profil & Reputasi"}
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-base
                leading-7
                text-slate-500
              "
            >
              {isPublicProfile
                ? "Lihat informasi, reputasi, dan ulasan pengguna di HelpMe."
                : "Kelola identitas akun, pantau reputasi, dan akses seluruh aktivitasmu dari satu tempat."}
            </p>
          </div>
        </header>

        {/* =========================
            MAIN PROFILE LAYOUT
        ========================= */}
        <div
          className="
            grid
            grid-cols-[380px_minmax(0,1fr)]
            items-start
            gap-7
          "
        >
          {/* =========================
              LEFT PROFILE
          ========================= */}
          <div
            className="
              sticky
              top-8
            "
          >
            <DesktopProfileSidebar
              profile={{
                fullName:
                  profile.fullName,

                username:
                  profile.username,

                avatarUrl:
                  profile.avatarUrl,

                bio:
                  profile.bio,

                location:
                  profile.location,

                initials:
                  profile.initials,
              }}
              isPublicProfile={
                isPublicProfile
              }
              onEdit={() => {
                window.location.href =
                  "/profile/edit";
              }}
              onReport={() => {
                setShowReportModal(
                  true,
                );
              }}
            />
          </div>

          {/* =========================
              RIGHT CONTENT
          ========================= */}
          <div className="min-w-0 space-y-7">
            {/* REPUTATION SUMMARY */}
            <section>
              <div className="mb-4">
                <h2
                  className="
                    text-lg
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  Ringkasan Reputasi
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Performa akun berdasarkan
                  aktivitas dan ulasan.
                </p>
              </div>

              <DesktopStatsCards
                averageRating={
                  profile.averageRating
                }
                completedTasks={
                  profile.completedTasks
                }
                totalReviews={
                  profile.totalReviews
                }
              />
            </section>

            {/* REPUTATION BADGE */}
            <section>
              <DesktopBadgeCard
                badges={profile.badges}
              />
            </section>

            {/* =========================
                PUBLIC USER REVIEWS
            ========================= */}
            {isPublicProfile &&
              reviewSection && (
                <section>
                  {reviewSection}
                </section>
              )}

            {/* =========================
                OWN PROFILE ACTIONS
            ========================= */}
            {!isPublicProfile && (
              <section>
                <DesktopQuickActions
                  role={role}
                  isPublicProfile={
                    false
                  }
                />
              </section>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {isPublicProfile && (
        <ReportUserModal
          open={showReportModal}
          onClose={() =>
            setShowReportModal(false)
          }
          reportedUserId={
            profileUserId || ""
          }
        />
      )}
    </main>
  );
}