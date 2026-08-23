"use client";

import Link from "next/link";

import { Star } from "lucide-react";

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
  review: Review;
}

function unwrapReviewer(
  reviewer:
    | Reviewer
    | Reviewer[]
    | null,
): Reviewer | null {
  if (!reviewer) {
    return null;
  }

  if (Array.isArray(reviewer)) {
    return reviewer[0] ?? null;
  }

  return reviewer;
}

function getInitials(
  fullName: string,
) {
  const words = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const first =
    words[0]?.charAt(0) || "";

  const second =
    words[1]?.charAt(0) || "";

  return (
    `${first}${second}`.toUpperCase() ||
    "U"
  );
}

export default function ReviewCard({
  review,
}: Props) {
  const reviewer =
    unwrapReviewer(
      review.reviewer,
    );

  const reviewerName =
    reviewer?.full_name?.trim() ||
    "Pengguna";

  const reviewerId =
    reviewer?.id || "";

  const avatarUrl =
    reviewer?.avatar_url || "";

  const initials =
    getInitials(reviewerName);

  const reviewerContent = (
    <>
      {/* AVATAR */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar ${reviewerName}`}
          className="
            h-11
            w-11
            shrink-0
            rounded-full
            border
            border-slate-200
            object-cover
            shadow-sm
          "
        />
      ) : (
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-indigo-100
            text-sm
            font-black
            text-indigo-700
          "
        >
          {initials}
        </div>
      )}

      {/* REVIEWER INFO */}
      <div className="min-w-0">
        <p
          className="
            truncate
            text-sm
            font-bold
            text-slate-900
            transition
            group-hover:text-indigo-600
          "
        >
          {reviewerName}
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-slate-500
          "
        >
          {new Date(
            review.created_at,
          ).toLocaleDateString(
            "id-ID",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            },
          )}
        </p>
      </div>
    </>
  );

  return (
    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        transition
        hover:border-slate-300
        hover:shadow-sm
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        {/* REVIEWER */}
        {reviewerId ? (
          <Link
            href={`/users/${reviewerId}`}
            className="
              group
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {reviewerContent}
          </Link>
        ) : (
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {reviewerContent}
          </div>
        )}

        {/* RATING */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            bg-amber-50
            px-3
            py-1.5
            text-sm
            font-bold
            text-amber-600
          "
        >
          <Star
            className="
              h-4
              w-4
              fill-amber-400
              text-amber-400
            "
          />

          <span>
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* COMMENT */}
      {review.comment && (
        <p
          className="
            mt-4
            whitespace-pre-wrap
            text-sm
            leading-6
            text-slate-600
          "
        >
          {review.comment}
        </p>
      )}
    </article>
  );
}