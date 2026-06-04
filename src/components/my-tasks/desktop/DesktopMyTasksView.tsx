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

export default function DesktopMyTasksView({
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
                bg-indigo-50
                px-4
                py-2
                text-sm
                font-semibold
                text-indigo-600
              "
            >
              Owner Dashboard
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
              Task Saya
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
              Kelola task, lihat pelamar,
              dan pantau progress task kamu.
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-3 gap-5">

          {/* OPEN */}
          <button
            onClick={() =>
              setActiveFilter("OPEN")
            }
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter === "OPEN"
                  ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-[0_20px_60px_rgba(79,70,229,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-indigo-200"
              }
            `}
          >

            <p
              className={
                activeFilter === "OPEN"
                  ? "text-indigo-100"
                  : "text-slate-500"
              }
            >
              Task Aktif
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

          </button>

          {/* ACCEPTED */}
          <button
            onClick={() =>
              setActiveFilter(
                "ACCEPTED"
              )
            }
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter ===
                "ACCEPTED"
                  ? "bg-amber-500 text-white shadow-[0_20px_60px_rgba(245,158,11,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-amber-200"
              }
            `}
          >

            <p
              className={
                activeFilter ===
                "ACCEPTED"
                  ? "text-amber-100"
                  : "text-slate-500"
              }
            >
              Sedang Dikerjakan
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
                    task.status ===
                    "ACCEPTED"
                ).length
              }
            </h2>

          </button>

          {/* COMPLETED */}
          <button
            onClick={() =>
              setActiveFilter(
                "COMPLETED"
              )
            }
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter ===
                "COMPLETED"
                  ? "bg-emerald-500 text-white shadow-[0_20px_60px_rgba(16,185,129,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-emerald-200"
              }
            `}
          >

            <p
              className={
                activeFilter ===
                "COMPLETED"
                  ? "text-emerald-100"
                  : "text-slate-500"
              }
            >
              Selesai
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
                    task.status ===
                    "COMPLETED"
                ).length
              }
            </h2>

          </button>

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
                Buat task pertama kamu sekarang.
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
                  hover:border-indigo-200
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
                      bg-indigo-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-indigo-600
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
                <h2
                  className="
                    mt-5
                    text-2xl
                    font-black
                    leading-9
                    tracking-tight
                    text-slate-900
                    transition
                    group-hover:text-indigo-600
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

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    📍 {task.address}
                  </p>

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