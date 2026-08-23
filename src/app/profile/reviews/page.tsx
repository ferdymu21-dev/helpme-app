"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import MobileReviewPage from "@/components/profile/mobile/MobileReviewPage";

import DesktopReviewPage from "@/components/profile/desktop/DesktopReviewPage";

import { getUserReviews } from "@/features/reviews/services/review.service";

interface Review {
  id: string;

  rating: number;

  comment: string;

  created_at: string;

  reviewer: {
    id: string;

    full_name: string;
  }[];
}

export default function ProfileReviewsPage() {

  const [reviews, setReviews] = useState<Review[]>([]);

  const REVIEWS_PER_PAGE = 5;

const [offset, setOffset] = useState(0);

const [hasMoreReviews, setHasMoreReviews] = useState(true);

const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

async function loadMoreReviews() {
  if (loadingMoreReviews || !hasMoreReviews) return;

  try {
    setLoadingMoreReviews(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const newReviews = await getUserReviews(
      user.id,
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

  useEffect(() => {
    async function loadReviews() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const reviewsData = await getUserReviews(
  user.id,
  REVIEWS_PER_PAGE,
  0,
);

setReviews(reviewsData);

setOffset(reviewsData.length);

setHasMoreReviews(
  reviewsData.length === REVIEWS_PER_PAGE,
);

      } catch (error) {
        console.error(error);
      }
    }

    loadReviews();
  }, []);

  return (
    <>
      <MobileReviewPage 
        reviews={reviews}
        hasMore={hasMoreReviews}
        loading={loadingMoreReviews}
        onLoadMore={loadMoreReviews}
      />

      <DesktopReviewPage 
        reviews={reviews}
        hasMore={hasMoreReviews}
        loading={loadingMoreReviews}
        onLoadMore={loadMoreReviews}
      />
    </>
  );
}