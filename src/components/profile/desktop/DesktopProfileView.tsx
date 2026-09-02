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
        relative
        hidden
        min-h-screen
        bg-slate-50
        lg:block
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-105
          bg-linear-to-b
          from-indigo-50
          via-violet-50/40
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-12
          h-96
          w-96
          rounded-full
          bg-indigo-100/40
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-360
          px-8
          py-10
          xl:px-10
          2xl:px-12
        "
      >
        {/* PAGE HEADER */}
        <header
          className="
            mb-8
            flex
            items-end
            justify-between
            gap-8
          "
        >
          <div className="max-w-3xl">
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
                text-indigo-700
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
                tracking-[-0.03em]
                text-slate-950
                xl:text-[42px]
              "
            >
              {isPublicProfile
                ? "Reputasi & Profil Pengguna"
                : "Profil & Reputasi Anda"}
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-[15px]
                leading-7
                text-slate-500
              "
            >
              {isPublicProfile
                ? "Kenali pengguna melalui informasi profil, aktivitas, pencapaian, serta ulasan dari komunitas HelpMe."
                : "Kelola identitas publik, pantau reputasi, pencapaian, dan seluruh aktivitas akun HelpMe dari satu tempat."}
            </p>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div
          className="
            grid
            grid-cols-[350px_minmax(0,1fr)]
            items-start
            gap-7
            xl:grid-cols-[370px_minmax(0,1fr)]
            xl:gap-8
          "
        >
          {/* LEFT */}
          <aside
  className="
    sticky
    top-6
    self-start
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
          </aside>

          {/* RIGHT */}
          <div className="min-w-0 space-y-7">
            {/* REPUTATION */}
            <section>
              <div
                className="
                  mb-4
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >
                <div>
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
                    Gambaran performa akun berdasarkan aktivitas dan ulasan.
                  </p>
                </div>
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

            {/* BADGES */}
            <DesktopBadgeCard
              badges={profile.badges}
            />

            {/* PUBLIC REVIEWS */}
            {isPublicProfile &&
              reviewSection && (
                <section>
                  {reviewSection}
                </section>
              )}

            {/* OWN PROFILE */}
            {!isPublicProfile && (
              <DesktopQuickActions
                role={role}
                isPublicProfile={
                  false
                }
              />
            )}
          </div>
        </div>
      </div>

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