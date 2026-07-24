"use client";

import { useState }
  from "react";

import Link from "next/link";

import DesktopQuickActions
  from "./DesktopQuickActions";

import DesktopProfileSidebar
  from "./DesktopProfileSidebar";

import DesktopStatsCards
  from "./DesktopStatsCards";

import DesktopBadgeCard
  from "./DesktopBadgeCard";

import {
  useAuthStore,
} from "@/store/auth.store";

import ReportUserModal
  from "@/features/reports/components/ReportUserModal";

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

  reviews: {
    id: string;

    rating: number;

    comment: string;

    created_at: string;

    reviewer: {
      id: string;

      full_name: string;
    }[];
  }[];

  profileUserId?: string;

  isPublicProfile?: boolean;
}

export default function DesktopProfileView({
  profile,
  reviews,
  profileUserId,
  isPublicProfile = false,
}: Props) {

  const [
    showReportModal,
    setShowReportModal,
  ] = useState(false);

  const role =
    useAuthStore(
      (state) => state.role
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

      <div className="mx-auto max-w-350 px-6 py-8">

        <div
          className="
    grid
    grid-cols-[360px_minmax(0,1fr)]
    gap-6
    items-start
  "
        >

          {/* LEFT */}

          <DesktopProfileSidebar
            profile={{
              fullName: profile.fullName,
              username: profile.username,
              avatarUrl: profile.avatarUrl,
              bio: profile.bio,
              location: profile.location,
              initials: profile.initials,
            }}
            isPublicProfile={isPublicProfile}
            onEdit={() => {
              window.location.href = "/profile/edit";
            }}
            onReport={() => {
              setShowReportModal(true);
            }}
          />

          {/* RIGHT */}
          <div className="col-span-1 space-y-6">

            <DesktopStatsCards
              averageRating={profile.averageRating}
              completedTasks={profile.completedTasks}
              totalReviews={profile.totalReviews}
            />

            <DesktopBadgeCard
              badges={profile.badges}
            />

            <DesktopQuickActions
              role={role}
              isPublicProfile={isPublicProfile}
            />

          </div>

        </div>

      </div>

      <ReportUserModal

        open={
          showReportModal
        }

        onClose={() =>
          setShowReportModal(
            false
          )
        }

        reportedUserId={
          profileUserId || ""
        }

      />

    </main>
  );
}