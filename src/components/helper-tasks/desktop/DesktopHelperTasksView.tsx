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
  loading: boolean;
  activeFilter: string;
  setActiveFilter: (
    value: string
  ) => void;
  filters: string[];
}

export default function DesktopHelperTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  filters,
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

      {/* CONTAINER */}
      <div className="mx-auto max-w-7xl px-10 py-10">

        {/* HEADER */}
        <div className="flex items-end justify-between">

          <div>

            {/* BADGE */}
            <div
              className="
                inline-flex
                rounded-full
                bg-emerald-50
                px-4
                py-2
                text-sm
                font-semibold
                text-emerald-600
              "
            >
              Helper Dashboard
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-6
                text-5xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Task Helper
            </h1>

            {/* SUBTITLE */}
            <p
              className="
                mt-4
                max-w-2xl
                text-lg
                leading-8
                text-slate-500
              "
            >
              Pantau task yang kamu lamar,
              sedang dikerjakan, dan task
              yang telah selesai.
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-3 gap-5">

          {/* APPLIED */}
          <div
            className="
              rounded-4xl
              bg-linear-to-br
              from-emerald-500
              to-green-600
              p-7
              text-white
              shadow-[0_20px_60px_rgba(16,185,129,0.25)]
            "
          >

            <p className="text-emerald-100">
              Dilamar
            </p>

            <h2
              className="
                mt-4
                text-6xl
                font-black
              "
            >
              {
                tasks.filter(
                  (task) =>
                    task.status === "OPEN"
                ).length
              }
            </h2>

          </div>

          {/* ACCEPTED */}
          <div
            className="
              rounded-4xl
              border
              border-slate-200
              bg-white
              p-7
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >

            <p className="text-slate-500">
              Sedang Dikerjakan
            </p>

            <h2
              className="
                mt-4
                text-6xl
                font-black
                text-slate-900
              "
            >
              {
                tasks.filter(
                  (task) =>
                    task.status ===
                    "ACCEPTED"
                ).length
              }
            </h2>

          </div>

          {/* COMPLETED */}
          <div
            className="
              rounded-4xl
              border
              border-slate-200
              bg-white
              p-7
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >

            <p className="text-slate-500">
              Selesai
            </p>

            <h2
              className="
                mt-4
                text-6xl
                font-black
                text-slate-900
              "
            >
              {
                tasks.filter(
                  (task) =>
                    task.status ===
                    "COMPLETED"
                ).length
              }
            </h2>

          </div>

        </div>

        {/* FILTER */}
        <div
          className="
            mt-8
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
        >

          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`
                whitespace-nowrap
                rounded-full
                px-5
                py-3
                text-sm
                font-semibold
                transition-all
                duration-200

                ${
                  activeFilter === filter
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              {filter}
            </button>
          ))}

        </div>

        {/* TASK GRID */}
        <div className="mt-10 grid grid-cols-3 gap-6">

          {loading ? (
            <div>
              Memuat task...
            </div>
          ) : tasks.length === 0 ? (
            <div
              className="
                col-span-3
                rounded-4xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-14
                text-center
              "
            >

              <h3
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                Belum ada task
              </h3>

              <p className="mt-4 text-slate-500">
                Kamu belum melamar task.
              </p>

            </div>
          ) : (
            tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="
                  group
                  rounded-4xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-xl
                "
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  {/* CATEGORY */}
                  <div
                    className="
                      inline-flex
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-emerald-600
                    "
                  >
                    {task.category}
                  </div>

                  {/* STATUS */}
                  <div
                    className="
                      rounded-full
                      bg-indigo-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-indigo-500
                    "
                  >
                    {task.status}
                  </div>

                </div>

                {/* TITLE */}
                <h2
                  className="
                    mt-5
                    text-2xl
                    font-black
                    leading-9
                    tracking-tight
                    text-slate-900
                    transition
                    group-hover:text-emerald-600
                  "
                >
                  {task.title}
                </h2>

                {/* BOTTOM */}
                <div
                  className="
                    mt-8
                    flex
                    items-center
                    justify-between
                  "
                >

                  {/* LOCATION */}
                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    📍 {task.address}
                  </p>

                  {/* PRICE */}
                  <div
                    className="
                      text-3xl
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
            ))
          )}

        </div>

      </div>

    </main>
  );
}