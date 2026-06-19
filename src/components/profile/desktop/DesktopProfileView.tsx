"use client";

import Link from "next/link";

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

export default function DesktopProfileView({
  profile,
  reviews,
  isPublicProfile = false,
}: Props) {

  return (
    <main
      className="
        hidden
        min-h-screen
        bg-slate-50
        lg:block
      "
    >

      <div className="mx-auto max-w-7xl px-10 py-10">

        <div className="grid grid-cols-3 gap-6">

          {/* LEFT */}
          <div
            className="
              rounded-4xl
              bg-white
              p-8
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >

            {/* AVATAR */}
            {profile.avatarUrl ? (

              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="
      h-28
      w-28
      rounded-full
      object-cover
    "
              />

            ) : (

              <div
                className="
      flex
      h-28
      w-28
      items-center
      justify-center
      rounded-full
      bg-indigo-100
      text-4xl
      font-black
      text-indigo-700
    "
              >
                {profile.initials}
              </div>

            )}

            <div className="mt-6">

              <div className="flex items-center gap-2">

                <h1
                  className="
                    text-3xl
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  {profile.fullName}
                </h1>

              </div>

              <p className="mt-2 text-slate-500">
                {profile.username}
              </p>

              <p
                className="
                  mt-5
                  leading-8
                text-slate-500
                "
              >
                {profile.bio ||

                  "Helper aktif dengan reputasi tinggi dan response cepat."
                }
              </p>

              {profile.location && (

                <div
                  className="
                    mt-3
                    text-sm
                    font-medium
                  text-slate-500
                  "
                >
                  📍 {profile.location}
                </div>

              )}

              {!isPublicProfile && (

                <button
                  className="
                    mt-3
                    flex
                    h-10
                    items-center
                    justify-center
                    rounded-2xl
                  bg-slate-900
                    px-3
                    text-sm
                    font-semibold
                  text-white
                    transition
                  hover:bg-slate-800
                  "

                  onClick={() =>
                    window.location.href =
                    "/profile/edit"
                  }
                >
                  Edit Profile
                </button>

              )}


            </div>

          </div>

          {/* RIGHT */}
          <div className="col-span-2 space-y-6">

            {/* STATS */}
            <div className="grid grid-cols-3 gap-5">

              {[
                {
                  title: "Rating",
                  value:
                    `⭐ ${profile.averageRating}`,
                },
                {
                  title: "Task Selesai",
                  value:
                    `🎯 ${profile.completedTasks}`,
                },
                {
                  title: "Reviews",
                  value:
                    `💬 ${profile.totalReviews}`,
                },
              ]
                .map((item) => (
                  <div
                    key={item.title}
                    className="
                    rounded-[28px]
                    bg-white
                    p-6
                    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                  "
                  >

                    <p className="text-slate-500">
                      {item.title}
                    </p>

                    <h2
                      className="
                      mt-4
                      text-4xl
                      font-black
                      tracking-tight
                      text-slate-900
                    "
                    >
                      {item.value}
                    </h2>

                  </div>
                ))}

            </div>

            {/* BADGES */}
            <div
              className="
                rounded-4xl
                bg-white
                p-6
                shadow-[0_10px_30px_rgba(15,23,42,0.05)]
              "
            >

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                Reputation Badge
              </h2>

              <div
                className="
    mt-5
    flex
    gap-3
    overflow-x-auto
    pb-2
  "
              >

                {(profile.badges || []).map(
                  (badge, index) => (

                    <div
                      key={index}

                      className={`
          shrink-0
          rounded-full
          px-4
          py-2
          text-xs
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

            {!isPublicProfile && (

              <div className="mt-4 ml-3 flex flex-wrap gap-3">

                <Link
                  href="/history"
                  className="
      rounded-full
      border
      border-slate-400
      px-4
      py-2
      text-sm
      font-semibold
      text-slate-700
    "
                >
                  📋 Riwayat Task
                </Link>

                <Link
                  href="/profile/verification"
                  className="
    rounded-full
    border
    bg-slate-400
    px-4
    py-2
    text-sm
    font-semibold
    text-slate-700
  "
                >
                  🛡️ Verifikasi Akun
                </Link>

                <button
                  className="
      rounded-full
      border
      border-slate-400
      px-4
      py-2
      text-sm
      font-semibold
      text-slate-700
    "
                >
                  💳 Pembayaran
                </button>

                <button
                  className="
      rounded-full
      border
      border-slate-400
      px-4
      py-2
      text-sm
      font-semibold
      text-slate-700
    "
                >
                  ⚙ Pengaturan
                </button>

              </div>

            )}

          </div>

        </div>

        {/* REVIEWS */}
        <div
          className="
    rounded-4xl
    bg-white
    p-6
    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
  "
        >

          <div className="flex items-center justify-between">

            <div>

              <h2
                className="
          text-2xl
          font-black
          tracking-tight
          text-slate-900
        "
              >
                Reviews
              </h2>

              <p className="mt-1 text-slate-500">
                Feedback dari user lain
              </p>

            </div>

            <div
              className="
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
          {reviews.length === 0 && (

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

          )}

          {/* REVIEW LIST */}
          <div className="mt-6 grid gap-4">

            {reviews.map((review) => (

              <div
                key={review.id}
                className="
          rounded-3xl
          border
          border-slate-200
          bg-slate-50
          p-5
        "
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>

                    <h3
                      className="
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
                text-sm
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
              rounded-2xl
              bg-amber-100
              px-3
              py-2
              text-sm
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
            mt-4
            leading-8
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

    </main>
  );
}