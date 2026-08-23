"use client";

import ReviewCard from "@/components/profile/shared/ReviewCard";

import type { UserReview } from "@/features/reviews/services/review.service";

interface Props {
  reviews: UserReview[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export default function DesktopReviewsView({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <div className="mt-5">
      <section
        className="
          rounded-4xl
          bg-white
          p-6
          shadow-[0_10px_30px_rgba(15,23,42,0.05)]
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-6
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Reviews
            </h1>

            <p className="mt-1 text-slate-500">
              Feedback dari user lain
            </p>
          </div>

          <div
            className="
              shrink-0
              rounded-2xl
              bg-amber-100
              px-4
              py-2
              text-sm
              font-bold
              text-amber-600
            "
          >
            {reviews.length} Reviews
          </div>
        </div>

        {/* EMPTY */}
        {reviews.length === 0 ? (
          <div
            className="
              mt-6
              rounded-3xl
              border
              border-dashed
              border-slate-200
              p-10
              text-center
            "
          >
            <p className="text-slate-500">
              Belum ada review
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {reviews.map(
              (review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
              ),
            )}
          </div>
        )}

        {/* LOAD MORE */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loading}
              className="
                rounded-2xl
                border
                border-slate-300
                px-6
                py-3
                font-semibold
                text-indigo-600
                transition
                hover:bg-indigo-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Memuat..."
                : "Lihat lebih banyak"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}