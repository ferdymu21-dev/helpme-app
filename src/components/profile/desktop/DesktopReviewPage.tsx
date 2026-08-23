"use client";

import DesktopReviewsView from "@/components/profile/desktop/DesktopReviewsView";

import type { UserReview } from "@/features/reviews/services/review.service";

interface Props {
  reviews: UserReview[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export default function DesktopReviewPage({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <main className="hidden lg:block">
      <div className="mx-auto max-w-5xl p-10">
        <DesktopReviewsView
          reviews={reviews}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
        />
      </div>
    </main>
  );
}