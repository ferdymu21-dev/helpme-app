"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import MobileReviewPage from "@/components/profile/mobile/MobileReviewPage";

import DesktopReviewPage from "@/components/profile/desktop/DesktopReviewPage";

import {
    getUserReviews,
} from "@/features/reviews/services/review.service";

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

export default function ProfileReviewsPage() {

    const [reviews, setReviews] =
        useState<Review[]>([]);

    useEffect(() => {

        async function loadReviews() {

            try {

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const reviewsData =
                    await getUserReviews(user.id);

                setReviews(reviewsData);

            } catch (error) {

                console.error(error);

            }

        }

        loadReviews();

    }, []);

    return (
        <>
            <MobileReviewPage
                reviews={reviews}
            />

            <DesktopReviewPage
                reviews={reviews}
            />
        </>
    );

}