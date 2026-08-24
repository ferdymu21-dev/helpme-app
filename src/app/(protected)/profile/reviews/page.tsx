"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

import MobileReviewPage from "@/components/profile/mobile/MobileReviewPage";
import DesktopReviewPage from "@/components/profile/desktop/DesktopReviewPage";

import {
  getUserReviews,
  type UserReview,
} from "@/features/reviews/services/review.service";

const REVIEWS_PER_PAGE = 5;

export default function ProfileReviewsPage() {
  const [
    reviews,
    setReviews,
  ] = useState<UserReview[]>([]);

  const [
    offset,
    setOffset,
  ] = useState(0);

  const [
    hasMoreReviews,
    setHasMoreReviews,
  ] = useState(true);

  const [
    loadingMoreReviews,
    setLoadingMoreReviews,
  ] = useState(false);

  async function loadMoreReviews() {
    if (
      loadingMoreReviews ||
      !hasMoreReviews
    ) {
      return;
    }

    try {
      setLoadingMoreReviews(true);

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const newReviews =
        await getUserReviews(
          user.id,
          REVIEWS_PER_PAGE,
          offset,
        );

      setReviews((prev) => [
        ...prev,
        ...newReviews,
      ]);

      setOffset(
        (prev) =>
          prev +
          newReviews.length,
      );

      if (
        newReviews.length <
        REVIEWS_PER_PAGE
      ) {
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error(
        "LOAD MORE REVIEWS ERROR:",
        error,
      );
    } finally {
      setLoadingMoreReviews(false);
    }
  }

  useEffect(() => {
    async function loadReviews() {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const reviewsData =
          await getUserReviews(
            user.id,
            REVIEWS_PER_PAGE,
            0,
          );

        setReviews(reviewsData);

        setOffset(
          reviewsData.length,
        );

        setHasMoreReviews(
          reviewsData.length ===
            REVIEWS_PER_PAGE,
        );
      } catch (error) {
        console.error(
          "LOAD REVIEWS ERROR:",
          error,
        );
      }
    }

    void loadReviews();
  }, []);

  return (
    <>
      <MobileReviewPage
        reviews={reviews}
        hasMore={
          hasMoreReviews
        }
        loading={
          loadingMoreReviews
        }
        onLoadMore={
          loadMoreReviews
        }
      />

      <DesktopReviewPage
        reviews={reviews}
        hasMore={
          hasMoreReviews
        }
        loading={
          loadingMoreReviews
        }
        onLoadMore={
          loadMoreReviews
        }
      />
    </>
  );
}