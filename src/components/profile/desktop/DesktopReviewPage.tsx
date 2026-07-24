"use client";

import Link from "next/link";

import DesktopReviewsView
    from "@/components/profile/desktop/DesktopReviewsView";

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
}

export default function DesktopReviewPage({
    reviews,
}: Props) {

return (

    <main className="hidden lg:block">

        <div className="mx-auto max-w-5xl p-10">

            <DesktopReviewsView
                reviews={reviews}
            />

        </div>

    </main>

);

}