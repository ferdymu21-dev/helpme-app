"use client";

import {
  CheckCircle2,
  MessageSquareText,
  Star,
  type LucideIcon,
} from "lucide-react";

interface Props {
  averageRating: string;
  completedTasks: number;
  totalReviews: number;
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBackground: string;
}

export default function DesktopStatsCards({
  averageRating,
  completedTasks,
  totalReviews,
}: Props) {
  const cards: StatCard[] = [
    {
      title: "Rating",
      value: averageRating,
      subtitle:
        "Rata-rata penilaian pengguna",
      icon: Star,
      iconClassName:
        "fill-amber-400 text-amber-400",
      iconBackground:
        "bg-amber-50",
    },
    {
      title: "Task Selesai",
      value: completedTasks,
      subtitle:
        "Task berhasil diselesaikan",
      icon: CheckCircle2,
      iconClassName:
        "text-emerald-600",
      iconBackground:
        "bg-emerald-50",
    },
    {
      title: "Total Review",
      value: totalReviews,
      subtitle:
        "Ulasan yang telah diterima",
      icon: MessageSquareText,
      iconClassName:
        "text-indigo-600",
      iconBackground:
        "bg-indigo-50",
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-3
        gap-4
        xl:gap-5
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="
              group
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]
              transition
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-300
              hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]
              xl:p-6
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  {card.title}
                </p>

                <p
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-tight
                    text-slate-950
                    xl:text-4xl
                  "
                >
                  {card.value}
                </p>
              </div>

              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  ${card.iconBackground}
                `}
              >
                <Icon
                  className={`
                    h-5
                    w-5
                    ${card.iconClassName}
                  `}
                  strokeWidth={2}
                />
              </div>
            </div>

            <p
              className="
                mt-4
                text-[11px]
                leading-5
                text-slate-400
              "
            >
              {card.subtitle}
            </p>
          </article>
        );
      })}
    </div>
  );
}