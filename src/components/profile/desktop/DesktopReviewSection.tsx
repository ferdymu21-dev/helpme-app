"use client";

import ProfileReviewList from "../shared/ProfileReviewList";

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

interface Props {
  reviews: Review[];

  hasMore: boolean;

  loading: boolean;

  onLoadMore: () => void;
}

export default function DesktopReviewSection({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <div className="hidden lg:block">
      <div className="mx-auto max-w-6xl px-8 pb-16">
        <ProfileReviewList
          reviews={reviews}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
        />
      </div>
    </div>
  );
}