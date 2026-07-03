"use client";

import {
    UserBadge,
    getUserBadges,
} from "@/features/badges/services/badge.service";

import DesktopProfileView
    from "@/components/profile/desktop/DesktopProfileView";

import MobileProfileView
    from "@/components/profile/mobile/MobileProfileView";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "next/navigation";

import { supabase }
    from "@/lib/supabase/client";

interface UserProfile {
    id: string;

    full_name: string;

    username: string;

    bio?: string;

    location?: string;

    verification_status?: string;

    rating?: number;

    total_reviews?: number;

    avatar_url?: string;
}

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

export default function PublicProfilePage() {

    const params = useParams();

    const [profile, setProfile] =
        useState<UserProfile | null>(
            null
        );

    const [reviews, setReviews] =
        useState<Review[]>([]);

    const [rating, setRating] =
        useState(0);

    const [completedTasks,
        setCompletedTasks] =
        useState(0);

    const [badges, setBadges] =
        useState<UserBadge[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function loadProfile() {

            try {

                /* =========================
                   PROFILE
                ========================= */

                const {
                    data: user,
                } = await supabase
                    .from("users")
                    .select("*")
                    .eq(
                        "id",
                        params.id
                    )
                    .single();

                if (!user) return;

                setProfile(user);

                /* =========================
                   REVIEWS
                ========================= */

                const {
                    data: reviewData,
                } = await supabase
                    .from("reviews")
                    .select(`
                      *,
                      reviewer:users!reviews_reviewer_id_fkey (
                        id,
                        full_name
                    )
                `)

                    .eq(
                        "reviewer_user_id",
                        params.id
                    )
                    .order("created_at", {
                        ascending: false,
                    });

                setReviews(
                    reviewData || []
                );

                /* =========================
                   RATING
                ========================= */

                if (
                    reviewData &&
                    reviewData.length > 0
                ) {

                    const total =
                        reviewData.reduce(
                            (sum, item) =>
                                sum + item.rating,
                            0
                        );

                    setRating(
                        total /
                        reviewData.length
                    );
                }

                /* =========================
                   COMPLETED TASKS
                ========================= */

                const {
                    count,
                } = await supabase
                    .from("tasks")
                    .select("*", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "selected_helper_id",
                        params.id
                    )
                    .eq(
                        "status",
                        "COMPLETED"
                    );

                setCompletedTasks(
                    count || 0
                );

                const generatedBadges =
                    getUserBadges(

                        count || 0,

                        Number(
                            user.rating || 0
                        ),

                        user.verification_status ===
                        "VERIFIED"
                    );

                setBadges(
                    generatedBadges
                );

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);
            }
        }

        loadProfile();

    }, [params.id]);

    if (loading) {

        return (
            <main className="p-10">
                Memuat profile...
            </main>
        );
    }

    if (!profile) {

        return (
            <main className="p-10">
                User tidak ditemukan
            </main>
        );
    }

    return (
        <>

            <MobileProfileView
                profile={{
                    fullName:
                        profile.full_name,

                    username:
                        `@${profile.username || ""}`,

                    bio:
                        profile.bio || "",

                    location:
                        profile.location || "",

                    avatarUrl:
                        profile.avatar_url || "",

                    initials:
                        profile.full_name
                            ?.charAt(0),

                    completedTasks,

                    totalReviews:
                        reviews.length,

                    averageRating:
                        rating.toFixed(1),

                    badges,
                }}
                reviews={reviews}

                profileUserId={profile.id}

                isPublicProfile={true}
            />

            <DesktopProfileView
                profile={{
                    fullName:
                        profile.full_name,

                    username:
                        `@${profile.username || ""}`,

                    bio:
                        profile.bio || "",

                    location:
                        profile.location || "",

                    avatarUrl:
                        profile.avatar_url || "",

                    initials:
                        profile.full_name
                            ?.charAt(0),

                    completedTasks,

                    totalReviews:
                        reviews.length,

                    averageRating:
                        rating.toFixed(1),
                        
                    badges,
                }}
                reviews={reviews}

                profileUserId={profile.id}
                
                isPublicProfile={true}
            />

        </>
    );
}