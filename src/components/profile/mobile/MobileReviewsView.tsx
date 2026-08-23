"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import ReviewCard from "@/components/profile/shared/ReviewCard";

import type { UserReview } from "@/features/reviews/services/review.service";

interface Props {
  reviews: UserReview[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export default function MobileReviewsView({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <div>
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <div className="relative flex h-10 items-center">
          {/* BACK */}
          <Link
            href="/profile"
            aria-label="Kembali ke halaman sebelumnya"
            className="
              relative
              z-10
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              active:scale-95
            "
          >
            <ArrowLeft
              className="h-5 w-5"
              strokeWidth={2}
            />
          </Link>

          {/* TITLE */}
          <h1
            className="
              pointer-events-none
              absolute
              left-1/2
              -translate-x-1/2
              whitespace-nowrap
              text-base
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Reviews
          </h1>
        </div>
      </div>

      {/* =========================
          REVIEW COUNT
      ========================= */}
      <div
  className="
    mt-5
    flex
    items-center
    justify-between
    gap-4
  "
>
  {/* SUBTITLE */}
  <p
    className="
      min-w-0
      text-left
      text-[13px]
      font-semibold
      leading-5
      text-slate-500
    "
  >
    Feedback dari user lain
  </p>

  {/* REVIEW COUNT */}
  <div
    className="
      shrink-0
      rounded-xl
      bg-amber-100
      px-2
      py-1.5
      text-xs
      font-bold
      text-amber-600
    "
  >
    {reviews.length} Reviews
  </div>
</div>

      {/* =========================
          EMPTY
      ========================= */}
      {reviews.length === 0 ? (
        <div
          className="
            mt-4
            rounded-3xl
            border
            border-dashed
            border-slate-200
            bg-white
            p-8
            text-center
          "
        >
          <p className="text-sm text-slate-500">
            Belum ada review
          </p>
        </div>
      ) : (
        /* =========================
            REVIEW LIST
        ========================= */
        <div className="mt-4 grid gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      )}

      {/* =========================
          LOAD MORE
      ========================= */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="
              rounded-xl
              border
              border-slate-200
              px-3
              py-1.5
              text-sm
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
              : "lebih banyak"}
          </button>
        </div>
      )}
    </div>
  );
}