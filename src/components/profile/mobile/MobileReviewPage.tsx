"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import MobileReviewsView from "@/components/profile/mobile/MobileReviewsView";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileReviewPage({
  reviews,
  hasMore,
  loading,
  onLoadMore,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">
      <div className="px-6 py-7">
        <Link
          href="/profile"
          aria-label="Kembali ke profile"
          className="
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
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <MobileReviewsView
          reviews={reviews}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
        />
      </div>

      <MobileBottomNavbar />
    </main>
  );
}