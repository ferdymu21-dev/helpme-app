"use client";

import {
  useEffect,
  useState,
} from "react";

import MobileProfileView
  from "@/components/profile/mobile/MobileProfileView";

import DesktopProfileView
  from "@/components/profile/desktop/DesktopProfileView";

import { supabase }
  from "@/lib/supabase/client";

import { useCurrentUser }
  from "@/features/profile/hooks/useCurrentUser";

import {
  getUserReputation,
} from "@/features/profile/services/profile.service";

import {
  getUserBadges,
} from "@/features/badges/services/badge.service";

import {
  getUserReviews,
} from "@/features/reviews/services/review.service";

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

interface Review {

  id: string;

  rating: number;

  comment: string;

  created_at: string;

  reviewer: {
    id: string;

    full_name: string;
  }[]
}

/* =========================
   PAGE
========================= */

export default function ProfilePage() {

  const {
    user,
    loading,
  } = useCurrentUser();

  const [profile, setProfile] =
    useState<UserProfile>({
      fullName: "User",

      username: "@user",

      avatarUrl: "",

      bio: "",

      location: "",

      initials: "U",

      completedTasks: 0,

      totalReviews: 0,

      averageRating: "0.0",

      badges: [],
    });

  const [reviews, setReviews] =
    useState<Review[]>([]);

  useEffect(() => {

    async function loadUser() {

      try {

        if (loading) return;

        if (!user) return;

        /* =========================
           USER INFO
        ========================= */

        const fullName =
          user.fullName || "User";

        const username =
          `@${user.username}`;

        const words =
          fullName.split(" ");

        const first =
          words[0]?.charAt(0) || "";

        const second =
          words[1]?.charAt(0) || "";

        const initials =
          `${first}${second}`
            .toUpperCase();

        /* =========================
           REPUTATION
        ========================= */

        const reputation =
          await getUserReputation(
            user.id
          );

        const badges =
          getUserBadges(

            reputation.completedTasks,

            Number(
              reputation.averageRating
            ),

            user.verificationStatus
              ?.toUpperCase() ===
            "VERIFIED"
          );

        /* =========================
           REVIEWS
        ========================= */

        const reviewsData =
          await getUserReviews(
            user.id
          );

        setReviews(reviewsData);

        /* =========================
           SET PROFILE
        ========================= */

        setProfile({
          fullName,

          username,

          avatarUrl:
            user.avatarUrl,

          bio:
            user.bio,

          location:
            user.location,

          initials,

          completedTasks:
            reputation.completedTasks,

          totalReviews:
            reputation.totalReviews,

          averageRating:
            reputation.averageRating,

          badges,
        });

      } catch (error) {

        console.error(error);
      }
    }

    loadUser();

  }, [user, loading]);

  return (
    <>

      <MobileProfileView
        profile={profile}
        reviews={reviews}
      />

      <DesktopProfileView
        profile={profile}
        reviews={reviews}
      />

    </>
  );
}