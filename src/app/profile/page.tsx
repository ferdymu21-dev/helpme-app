"use client";

import { useEffect, useState } from "react";

import MobileProfileView from "@/components/profile/mobile/MobileProfileView";
import DesktopProfileView from "@/components/profile/desktop/DesktopProfileView";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

import { getUserReputation } from "@/features/profile/services/profile.service";

import { getUserBadges } from "@/features/badges/services/badge.service";

/* =========================
   INTERFACES
========================= */

interface UserProfile {
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
}

interface ProfileLoadResult {
  userId: string;
  profile: UserProfile | null;
}

/* =========================
   PAGE
========================= */

export default function ProfilePage() {
  const {
    user,
    loading: currentUserLoading,
  } = useCurrentUser();

  const [
    profileResult,
    setProfileResult,
  ] = useState<ProfileLoadResult | null>(
    null,
  );

  useEffect(() => {
    if (
      currentUserLoading ||
      !user
    ) {
      return;
    }

    /*
     * Simpan referensi user yang sudah
     * dipastikan tidak null.
     *
     * Ini juga menghindari TypeScript:
     * "user is possibly null"
     * di dalam fungsi async.
     */
    const currentUser = user;

    let cancelled = false;

    async function loadProfile() {
      try {
        /* =========================
           REPUTATION
        ========================= */

        const reputation =
          await getUserReputation(
            currentUser.id,
          );

        if (cancelled) {
          return;
        }

        /* =========================
           USER INFO
        ========================= */

        const fullName =
          currentUser.fullName.trim() ||
          "User";

        const username =
          currentUser.username.trim();

        const words = fullName
          .split(/\s+/)
          .filter(Boolean);

        const firstInitial =
          words[0]?.charAt(0) || "";

        const secondInitial =
          words[1]?.charAt(0) || "";

        const initials =
          `${firstInitial}${secondInitial}`.toUpperCase() ||
          "U";

        /* =========================
           BADGES
        ========================= */

        const badges = getUserBadges(
          reputation.completedTasks,

          Number(
            reputation.averageRating,
          ),

          currentUser.verificationStatus
            .toUpperCase() ===
            "VERIFIED",
        );

        /* =========================
           SET PROFILE RESULT
        ========================= */

        setProfileResult({
          userId: currentUser.id,

          profile: {
            fullName,

            username: username
              ? `@${username}`
              : "",

            avatarUrl:
              currentUser.avatarUrl ||
              "",

            bio:
              currentUser.bio || "",

            location:
              currentUser.location ||
              "",

            initials,

            completedTasks:
              reputation.completedTasks,

            totalReviews:
              reputation.totalReviews,

            averageRating:
              reputation.averageRating,

            badges,
          },
        });
      } catch (error) {
        console.error(
          "LOAD PROFILE ERROR:",
          error,
        );

        if (cancelled) {
          return;
        }

        setProfileResult({
          userId: currentUser.id,
          profile: null,
        });
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    currentUserLoading,
  ]);

  /* =========================
     CURRENT USER LOADING
  ========================= */

  if (currentUserLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-500">
        Memuat profile...
      </main>
    );
  }

  /* =========================
     NO AUTH USER
  ========================= */

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
          "
        >
          <h1 className="text-xl font-bold text-slate-900">
            Profile tidak tersedia
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            User tidak ditemukan.
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     PROFILE LOADING
  ========================= */

  const currentProfileResult =
    profileResult?.userId === user.id
      ? profileResult
      : null;

  if (!currentProfileResult) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-500">
        Memuat profile...
      </main>
    );
  }

  /* =========================
     PROFILE LOAD FAILED
  ========================= */

  if (!currentProfileResult.profile) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
          "
        >
          <h1 className="text-xl font-bold text-slate-900">
            Profile tidak tersedia
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data profile tidak dapat
            dimuat.
          </p>
        </div>
      </main>
    );
  }

  const profile =
    currentProfileResult.profile;

  /* =========================
     PROFILE VIEW
  ========================= */

  return (
    <>
      <MobileProfileView
        profile={profile}
      />

      <DesktopProfileView
        profile={profile}
      />
    </>
  );
}