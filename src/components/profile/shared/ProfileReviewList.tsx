"use client";

import ReviewCard from "./ReviewCard";

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

export default function ProfileReviewList({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">Review Pengguna</h2>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Belum ada review.</p>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="
        rounded-xl
        border
        border-slate-200
        px-5
        py-2
        text-sm
        font-semibold
        text-indigo-600
        transition
        hover:bg-indigo-50
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
              >
                {loading ? "Memuat..." : "Lihat lebih banyak"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}