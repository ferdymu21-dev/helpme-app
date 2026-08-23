"use client";

import {
  Award,
  Trophy,
} from "lucide-react";

interface Badge {
  label: string;
  icon: string;
  className: string;
}

interface Props {
  badges: Badge[];
}

export default function DesktopBadgeCard({
  badges,
}: Props) {
  const hasBadges = badges.length > 0;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[36px]
        bg-linear-to-br
        from-white
        via-white
        to-indigo-50
        p-8
        shadow-[0_12px_40px_rgba(15,23,42,.06)]
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          absolute
          -bottom-20
          -right-20
          h-72
          w-72
          rounded-full
          bg-indigo-100/40
        "
      />

      <div
        className="
          absolute
          right-10
          top-10
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-indigo-100/60
          text-indigo-500
        "
      >
        <Award
          className="h-8 w-8"
          strokeWidth={1.8}
        />
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-10
        "
      >
        {/* LEFT */}
        <div className="max-w-xl">
          <h2
            className="
              text-3xl
              text-[18px]
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Reputation Badge
          </h2>

          <p
            className="
              mt-2
              text-[14px]
              leading-8
              text-slate-500
            "
          >
            Badge diperoleh berdasarkan performa, rating,
            konsistensi, serta reputasi sebagai helper.
          </p>

          {hasBadges ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {badges.map(
                (badge, index) => (
                  <div
                    key={`${badge.label}-${index}`}
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-[12px]
                      font-bold
                      shadow-sm

                      ${badge.className}
                    `}
                  >
                    {badge.icon}{" "}
                    {badge.label}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-white/70
                px-5
                py-4
              "
            >
              <p className="text-sm font-semibold text-slate-600">
                Belum ada badge reputasi
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Selesaikan task dan pertahankan rating yang baik
                untuk memperoleh badge.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div
          className="
            hidden
            flex-col
            items-center
            justify-center
            text-center
            lg:flex
          "
        >
          <div
            className="
              flex
              h-44
              w-44
              items-center
              justify-center
              rounded-full
              bg-linear-to-br
              from-indigo-500
              to-violet-500
              text-white
              shadow-xl
            "
          >
            <Trophy
              className="h-20 w-20"
              strokeWidth={1.5}
            />
          </div>

          <p
            className="
              mt-5
              text-sm
              font-semibold
              text-slate-500
            "
          >
            Reputation Level
          </p>
        </div>
      </div>
    </section>
  );
}