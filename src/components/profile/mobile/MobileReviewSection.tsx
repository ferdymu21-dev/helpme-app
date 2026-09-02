"use client";

import ProfileReviewList from "../shared/ProfileReviewList";

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
    <section
      className="
        bg-slate-50
        px-5
        pt-2
        pb-32
        lg:hidden
      "
    >
      <ProfileReviewList
        reviews={reviews}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
      />
    </section>
  );
}