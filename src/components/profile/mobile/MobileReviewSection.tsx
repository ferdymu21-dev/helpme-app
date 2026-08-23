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

export default function MobileReviewSection({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <div className="-mt-37 px-6 pb-32 lg:hidden">
      <ProfileReviewList
        reviews={reviews}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}