"use client";

import Link from "next/link";

import {
  SignOut,
} from "@phosphor-icons/react";

import {
  logout,
} from "@/features/auth/services/auth.service";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

interface Props {
  profile: {
    fullName: string;

    username: string;

    avatarUrl: string;

    bio: string;

    location: string;

    initials: string;

    completedTasks: number;

    totalReviews: number;

    averageRating: string;

    badges: {

      label: string;

      icon: string;

      className: string;
    }[];
  };

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

  isPublicProfile?: boolean;
}

export default function MobileProfileView({
  profile,
  reviews,
  isPublicProfile = false,
}: Props) {

  async function handleLogout() {

    const confirmLogout =
      confirm(
        "Keluar dari akun?"
      );

    if (!confirmLogout) return;

    try {

      await logout();

      window.location.href =
        "/login";

    } catch (error) {

      console.error(error);

      alert("Gagal logout");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

      {/* CONTAINER */}
      <div className="px-6 py-7">

        {/* PROFILE CARD */}
        <div
          className="
            rounded-3xl
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
          "
        >

          {/* TOP */}
          <div className="flex items-start justify-between">

            <div className="flex items-center gap-4">

              {/* AVATAR */}
              {profile.avatarUrl ? (

                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="
      h-17
      w-17
      rounded-full
      object-cover
    "
                />

              ) : (

                <div
                  className="
      flex
      h-17
      w-17
      items-center
      justify-center
      rounded-full
      bg-indigo-100
      text-2xl
      font-black
      text-indigo-700
    "
                >
                  {profile.initials}
                </div>

              )}

              {/* INFO */}
              <div>

                <div className="flex items-center gap-2">

                  <h1
                    className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                  >
                    {profile.fullName}
                  </h1>

                </div>

                <p
                  className="
                  mt-1
                  text-xs
                  text-slate-500
                "
                >
                  {profile.username}
                </p>

                {profile.bio ? (

                  <p
                    className="
      mt-1
      text-xs
      leading-3.5
      text-slate-500
    "
                  >
                    {profile.bio}
                  </p>

                ) : (

                  <p
                    className="
      mt-1
      text-[11px]
      leading-3
      text-slate-500
    "
                  >
                    Helper aktif yang siap
                    membantu task harianmu.
                  </p>

                )}

                {profile.location && (

                  <div
                    className="
      mt-1
      text-[10px]
      font-medium
      text-slate-500
    "
                  >
                    📍 {profile.location}
                  </div>

                )}

                {/* BADGES */}
                <div
                  className="
    mt-3
    flex
    gap-1
    overflow-x-auto
    pb-1
    scrollbar-hide
  "
                >

                  {(profile.badges || []).map(
                    (badge, index) => (

                      <div
                        key={index}

                        className={`
          shrink-0
          rounded-full
          px-2
          py-1.5
          text-[8px]
          font-bold
          whitespace-nowrap

          ${badge.className}
        `}
                      >

                        {badge.icon}
                        {" "}
                        {badge.label}

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

            <button
              onClick={handleLogout}

              className="
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-2xl
    border
    border-slate-200
    bg-slate-50
    text-slate-600
    transition
    active:scale-95
  "
            >

              <SignOut
                size={15}
                weight="bold"
              />

            </button>

          </div>

          {/* STATS */}
          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-3
            "
          >

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                Rating
              </p>

              <h2
                className="
                  mt-2
                  text-base
                  font-black
                  text-slate-900
                "
              >
                ⭐ {profile.averageRating}
              </h2>

            </div>

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                Selesai
              </p>

              <h2
                className="
                  mt-2
                  text-base
                  font-black
                  text-slate-900
                "
              >
                🎯 {profile.completedTasks}
              </h2>

            </div>

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                Reviews
              </p>

              <h2
                className="
                  mt-2
                  text-base
                  font-black
                  text-slate-900
                "
              >
                💬 {profile.totalReviews}
              </h2>

            </div>

          </div>

          {/* BUTTON */}
          {!isPublicProfile && (

            <Link
              href="/profile/edit"
              className="
              mt-6
              flex
              h-13
              items-center
              justify-center
              rounded-2xl
              bg-slate-900
              text-sm
              font-semibold
              text-white
            "
            >
              Edit Profile
            </Link>

          )}

        </div>

        {/* MENU */}
        {!isPublicProfile && (

          <div className="mt-6 space-y-3">

            {[
              {
                label: "📋 Riwayat Task",
                href: "/history",
              },

              {
                label: "🛡️ Verifikasi Akun",
                href: "/profile/verification",
              },

              {
                label: "💳 Metode Pembayaran",
                href: "/payment-method",
              },

              {
                label: "⚙ Pengaturan",
                href: "/settings",
              },
            ].map((item) => (

              <Link
                key={item.label}
                href={item.href}
                className="
      flex
      w-full
      items-center
      justify-between
      rounded-2xl
      bg-white
      px-5
      py-4
      text-left
      shadow-sm
    "
              >

                <span
                  className="
        text-sm
        font-semibold
        text-slate-700
      "
                >
                  {item.label}
                </span>

                <span className="text-slate-400">
                  →
                </span>

              </Link>

            ))}

          </div>

        )}

        {/* REVIEWS */}
        <div className="mt-5">

          <div className="flex items-center justify-between">

            <div>

              <h2
                className="
          text-sm
          font-bold
          text-slate-900
        "
              >
                Reviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Feedback dari user lain
              </p>

            </div>

            <div
              className="
        rounded-xl
        bg-amber-100
        px-3
        py-2
        text-xs
        font-bold
        text-amber-600
      "
            >
              {reviews.length} Reviews
            </div>

          </div>

          {/* EMPTY */}
          {reviews.length === 0 && (

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

          )}

          {/* REVIEW LIST */}
          <div className="mt-3 grid gap-4">

            {reviews.map((review) => (

              <div
                key={review.id}
                className="
          rounded-2xl
          bg-white
          p-5
          shadow-sm
        "
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>

                    <h3
                      className="
                      text-sm
                font-semibold
                text-slate-900
              "
                    >
                      {review.reviewer?.[0]
                        ?.full_name ||
                        "Anonymous"}
                    </h3>

                    <p
                      className="
                mt-1
                text-[10px]
                text-slate-400
              "
                    >
                      {new Date(
                        review.created_at
                      ).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>

                  </div>

                  <div
                    className="
              rounded-xl
            bg-amber-100
              px-3
              py-2
              text-xs
              font-bold
            text-amber-600
            "
                  >
                    ⭐ {review.rating}/5
                  </div>

                </div>

                {/* COMMENT */}
                <p
                  className="
            mt-2
            text-sm
            leading-3
            text-slate-600
          "
                >
                  {review.comment}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      <MobileBottomNavbar />

    </main>
  );
}