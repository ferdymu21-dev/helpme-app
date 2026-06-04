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

export default function TaskFeed({
  tasks,
}: Props) {
  return (
    <section className="px-8 pt-8 pb-20">

      <div className="mx-auto max-w-300">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Task Terbaru
            </h2>

            <p className="mt-2 text-slate-500">
              Temukan task di sekitar kamu
            </p>

          </div>

        </div>

        {/* FILTERS */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

          {[
            "Semua",
            "Belanja",
            "Dokumen",
            "Antri",
            "Kurir",
            "Lainnya",
          ].map((item, index) => (
            <button
              key={item}
              className={`
                whitespace-nowrap
                rounded-full
                px-6
                py-3
                text-sm
                font-semibold
                transition
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

        {/* TASK GRID */}
        <div className="mt-8 grid grid-cols-4 gap-6">

          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="
                group
                rounded-[28px]
                borgroup
                border
              border-slate-200
              bg-white
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
              hover:border-indigo-200
                hover:shadow-xl
              "
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div>

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
                      text-indigo-600
                    "
                  >
                    {task.category}
                  </div>

                  {/* TITLE */}
                  <h3
                    className="
                      mt-4
                      text-lg
                      leading-8
                      font-bold
                      tracking-tight
                      text-slate-900
                      transition
                      hover:-translate-y-0.5
                      group-hover:text-indigo-600
                    "
                  >
                    {task.title}
                  </h3>

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

              {/* BOTTOM */}
              <div className="mt-7 space-y-4">

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