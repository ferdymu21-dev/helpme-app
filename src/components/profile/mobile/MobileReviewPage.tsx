"use client";

import Link from "next/link";

import MobileReviewsView
    from "@/components/profile/mobile/MobileReviewsView";

import MobileBottomNavbar
    from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileReviewPage({
    reviews,
}: Props) {

    return (

        <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

            <div className="px-6 py-7">

                <Link
                    href="/profile"
                    className="
                      text-sm
                      font-semibold
                   text-indigo-600
                   "
                >
                    ← Kembali
                </Link>

                <MobileReviewsView
                    reviews={reviews}
                />

            </div>

            <MobileBottomNavbar />

        </main>

    );

}