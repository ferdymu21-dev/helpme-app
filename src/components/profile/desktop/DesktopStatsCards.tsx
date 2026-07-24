"use client";

interface Props {
  averageRating: string;
  completedTasks: number;
  totalReviews: number;
}

export default function DesktopStatsCards({
  averageRating,
  completedTasks,
  totalReviews,
}: Props) {

  const cards = [

    {
      icon: "⭐",
      title: "Rating",
      value: averageRating,
      subtitle: "Rata-rata penilaian",
      color:
        "from-amber-50 to-yellow-50",
    },

    {
      icon: "🎯",
      title: "Task Selesai",
      value: completedTasks,
      subtitle: "Task berhasil diselesaikan",
      color:
        "from-emerald-50 to-green-50",
    },

    {
      icon: "💬",
      title: "Reviews",
      value: totalReviews,
      subtitle: "Review diterima",
      color:
        "from-violet-50 to-indigo-50",
    },

  ];

  return (

    <div
      className="
        grid
        grid-cols-3
        gap-6
      "
    >

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

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-slate-500
                "
              >

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

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-500
                "
              >

                {card.subtitle}

              </p>

            </div>

            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-white
                text-4xl
                shadow
              "
            >

              {card.icon}

            </div>

          </div>

        </div>

      ))}

    </div>

  );

}