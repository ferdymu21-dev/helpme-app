"use client";

import Link from "next/link";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  address: string;
  status: string;
}

interface Props {
  tasks: Task[];
}

export default function MobileTaskFeed({
  tasks,
}: Props) {
  return (
    <section className="px-6 pt-8 pb-20">

      <div className="mx-auto max-w-300">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>

            <h2
              className="
                text-xl
                font-black
                leading-tight
                tracking-tight
                text-slate-900
              "
            >
              Task Terbaru
            </h2>

            <p
              className="
                mt-3
                text-xs
              text-slate-500
              "
            >
              Temukan task di sekitar kamu
            </p>

          </div>

        </div>

        {/* FILTERS */}
        <div
          className="
            mt-6
            flex
            gap-3
            overflow-x-auto
            pb-2
            scrollbar-hide
          "
        >

          {[
            "Semua",
            "Belanja",
            "Dokumen",
            "Antri",
            "Kurir",
            "Kampus",
          ].map((item, index) => (
            <button
              key={item}
              className={`
                whitespace-nowrap
                rounded-2xl
                px-3
                py-2
                text-xs
                font-semibold
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5

                ${
                  index === 0
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              {item}
            </button>
          ))}

        </div>

        {/* TASK LIST */}
        <div className="mt-7 space-y-4">

          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="
                block
                rounded-4xl
                border
              border-slate-100
              bg-white
                p-3
                shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                transition-all
                duration-300
                active:scale-[0.98]
              "
            >

              {/* TOP */}
              <div className="flex items-center justify-between">

                {/* CATEGORY */}
                <div
                  className="
                    inline-flex
                    rounded-full
                    bg-indigo-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-indigo-700
                  "
                >
                  {task.category}
                </div>

                {/* STATUS */}
                <div
                  className="
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-emerald-500
                  "
                >
                  {task.status}
                </div>

              </div>

              {/* TITLE */}
              <h3
                className="
                  mt-4
                  text-xl
                  font-black
                  leading-5
                  tracking-tight
                  text-slate-900
                "
              >
                {task.title}
              </h3>

              {/* BOTTOM */}
              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-between
                "
              >

                {/* LOCATION */}
                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  📍 {task.address}
                </p>

                {/* PRICE */}
                <div
                  className="
                    text-xl
                    font-black
                    tracking-tight
                  text-amber-500
                  "
                >
                  Rp
                  {task.budget.toLocaleString(
                    "id-ID"
                  )}
                </div>

              </div>

            </Link>
          ))}

        </div>

      </div>

    </section>
  );
}