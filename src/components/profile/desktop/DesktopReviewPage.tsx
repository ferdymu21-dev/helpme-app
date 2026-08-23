"use client";


import DesktopReviewsView from "@/components/profile/desktop/DesktopReviewsView";

interface Props {
  reviews: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer: {
      id: string;
      full_name: string;
    }[];
  }[];
  
  hasMore: boolean;

  loading: boolean;

  onLoadMore: () => void;
}

export default function DesktopReviewPage({ reviews, hasMore, loading, onLoadMore }: Props) {
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