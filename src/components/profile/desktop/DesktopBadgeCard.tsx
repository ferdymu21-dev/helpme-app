"use client";

import {
  Award,
  Sparkles,
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
  const hasBadges =
    badges.length > 0;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-slate-200
        bg-white
        p-6
        shadow-[0_10px_30px_rgba(15,23,42,0.045)]
        xl:p-7
      "
    >
      {/* DECORATION */}
      <div
        className="
          pointer-events-none
          absolute
          -top-28
          -right-28
          h-64
          w-64
          rounded-full
          bg-indigo-50
        "
      />

      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-8
        "
      >
        <div className="min-w-0">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <Award
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                Pencapaian & Reputasi
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Badge diperoleh dari aktivitas dan reputasi akun.
              </p>
            </div>
          </div>

          {hasBadges ? (
            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2.5
              "
            >
              {badges.map(
                (badge, index) => (
                  <div
                    key={`${badge.label}-${index}`}
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3.5
                      py-2
                      text-xs
                      font-bold
                      shadow-sm

                      ${badge.className}
                    `}
                  >
                    <span>
                      {badge.icon}
                    </span>

                    <span>
                      {badge.label}
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-slate-50
                p-4
              "
            >
              <Sparkles
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Belum ada pencapaian
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Selesaikan task, pertahankan rating, dan bangun reputasi
                  untuk memperoleh badge.
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="
            hidden
            h-20
            w-20
            shrink-0
            items-center
            justify-center
            rounded-[26px]
            border
            border-indigo-100
            bg-linear-to-br
            from-indigo-50
            to-violet-50
            text-indigo-500
            xl:flex
          "
        >
          <Sparkles
            className="h-8 w-8"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </section>
  );
}