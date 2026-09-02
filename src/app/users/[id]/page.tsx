"use client";

import {
  UserBadge,
  getUserBadges,
} from "@/features/badges/services/badge.service";

import DesktopProfileView from "@/components/profile/desktop/DesktopProfileView";

import MobileProfileView from "@/components/profile/mobile/MobileProfileView";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { getUserReputation } from "@/features/profile/services/profile.service";

import { getUserReviews } from "@/features/reviews/services/review.service";

import MobileReviewSection from "@/components/profile/mobile/MobileReviewSection";

import DesktopReviewSection from "@/components/profile/desktop/DesktopReviewSection";

interface UserProfile {
  id: string;

  full_name: string;

  username: string;

  bio?: string;

  location?: string;

  verification_status?: string;

  rating?: number;

  total_reviews?: number;

  avatar_url?: string;
}

interface Reviewer {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;

  reviewer:
    | Reviewer
    | Reviewer[]
    | null;
}

export default function PublicProfilePage() {
  const params = useParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [totalReviews, setTotalReviews] = useState(0);

  const REVIEWS_PER_PAGE = 5;

  const [offset, setOffset] = useState(0);

  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  async function loadMoreReviews() {
    if (loadingMoreReviews || !hasMoreReviews) return;

    try {
      setLoadingMoreReviews(true);

      const newReviews = await getUserReviews(
        String(params.id),
        REVIEWS_PER_PAGE,
        offset,
      );

      setReviews((prev) => [...prev, ...newReviews]);

      setOffset((prev) => prev + newReviews.length);

      if (newReviews.length < REVIEWS_PER_PAGE) {
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMoreReviews(false);
    }
  }

  const [rating, setRating] = useState(0);

  const [completedTasks, setCompletedTasks] = useState(0);

  const [badges, setBadges] = useState<UserBadge[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        /* =========================
           PROFILE
        ========================= */

        const { data: user } = await supabase
  .from("users")
  .select(
    `
      id,
      full_name,
      username,
      bio,
      location,
      verification_status,
      avatar_url
    `,
  )
  .eq("id", params.id)
  .single();

        if (!user) return;

        setProfile(user);

        /* =========================
           REPUTATION
        ========================= */

        const reputation = await getUserReputation(String(params.id));

setCompletedTasks(reputation.completedTasks);

setRating(Number(reputation.averageRating));

setTotalReviews(reputation.totalReviews);

        /* =========================
           REVIEWS
        ========================= */

        const reviewData = await getUserReviews(
          String(params.id),
          REVIEWS_PER_PAGE,
          0,
        );

        setReviews(reviewData);

        setOffset(reviewData.length);

        setHasMoreReviews(reviewData.length === REVIEWS_PER_PAGE);

        /* =========================
   BADGES
========================= */

        setBadges(
          getUserBadges(
            reputation.completedTasks,
            Number(reputation.averageRating),
            user.verification_status === "VERIFIED",
          ),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [params.id]);

  if (loading) {
    return <main className="p-10">Memuat profile...</main>;
  }

  if (!profile) {
    return <main className="p-10">User tidak ditemukan</main>;
  }

  return (
    <>
      <MobileProfileView
        profile={{
          fullName: profile.full_name,

          username: `@${profile.username || ""}`,

          bio: profile.bio || "",

          location: profile.location || "",

          avatarUrl: profile.avatar_url || "",

          initials: profile.full_name?.charAt(0),

          completedTasks,

          totalReviews,

          averageRating: rating.toFixed(1),

          badges,
        }}
        profileUserId={profile.id}
        isPublicProfile={true}
      />

      <DesktopProfileView
  profile={{
    fullName: profile.full_name,

    username: profile.username
      ? `@${profile.username}`
      : "",

    bio: profile.bio || "",

    location:
      profile.location || "",

    avatarUrl:
      profile.avatar_url || "",

    initials:
      profile.full_name
        ?.charAt(0)
        .toUpperCase() || "U",

    completedTasks,

    totalReviews: reviews.length,

    averageRating:
      rating.toFixed(1),

    badges,
  }}
  profileUserId={profile.id}
  isPublicProfile={true}
  reviewSection={
    <DesktopReviewSection
      reviews={reviews}
      hasMore={hasMoreReviews}
      loading={loadingMoreReviews}
      onLoadMore={loadMoreReviews}
    />
  }
/>

      <MobileReviewSection
        reviews={reviews}
        hasMore={hasMoreReviews}
        loading={loadingMoreReviews}
        onLoadMore={loadMoreReviews}
      />
    </>
  );
}