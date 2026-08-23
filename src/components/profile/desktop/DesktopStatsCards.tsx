"use client";

import Image from "next/image";

interface Props {
  averageRating: string;
  completedTasks: number;
  totalReviews: number;
}

interface StatCard {
  icon: string;
  alt: string;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  iconBackground: string;
}

export default function DesktopStatsCards({
  averageRating,
  completedTasks,
  totalReviews,
}: Props) {
  const cards: StatCard[] = [
    {
      icon: "/icons/profile/star.svg",
      alt: "Rating",
      title: "Rating",
      value: averageRating,
      subtitle: "Rata-rata penilaian",
      color: "from-amber-50 to-yellow-50",
      iconBackground: "bg-amber-100/70",
    },
    {
      icon: "/icons/profile/selesai.svg",
      alt: "Task selesai",
      title: "Task Selesai",
      value: completedTasks,
      subtitle: "Task berhasil diselesaikan",
      color: "from-emerald-50 to-green-50",
      iconBackground: "bg-emerald-100/70",
    },
    {
      icon: "/icons/profile/review.svg",
      alt: "Reviews",
      title: "Reviews",
      value: totalReviews,
      subtitle: "Review diterima",
      color: "from-violet-50 to-indigo-50",
      iconBackground: "bg-violet-100/70",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            rounded-4xl
            bg-linear-to-br
            ${card.color}
            p-7
            shadow-[0_10px_30px_rgba(15,23,42,.05)]
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <h2
                className="
                  mt-4
                  text-5xl
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                {card.value}
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                {card.subtitle}
              </p>
            </div>

            <div
              className={`
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                rounded-3xl
                ${card.iconBackground}
              `}
            >
              <Image
                src={card.icon}
                alt={card.alt}
                width={38}
                height={38}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}