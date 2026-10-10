"use client";

import AutoHideMobileBottomNavbar from "@/components/layout/mobile/AutoHideMobileBottomNavbar";

import MobileReviewsView from "@/components/profile/mobile/MobileReviewsView";

import type { UserReview } from "@/features/reviews/services/review.service";

interface Props {
  reviews: UserReview[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export default function MobileReviewPage({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <main
      className="
        relative mx-auto min-h-screen w-full max-w-md
        bg-slate-50
        pb-32
        lg:shadow-xl lg:ring-1 lg:ring-slate-200
      "
    >
      <div className="px-6 py-7">
        <MobileReviewsView
          reviews={reviews}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
        />
      </div>

      {/* =========================
          MOBILE BOTTOM NAVBAR
      ========================= */}
      <AutoHideMobileBottomNavbar forceVisible />
    </main>
  );
}