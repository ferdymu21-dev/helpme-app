"use client";

import Link from "next/link";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileMyTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  filters,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

      {/* CONTAINER */}
      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* HEADER */}
        <div>

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

          <h1
            className="
              mt-5
              text-xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Task Saya
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-slate-500
            "
          >
            Kelola task, lihat pelamar,
            dan pantau progress task kamu.
          </p>

        </div>

        {/* STATS */}
        <div
          className="
            mt-8
            grid
            grid-cols-3
            gap-3
          "
        >

          {/* OPEN */}
          <button
            onClick={() =>
              setActiveFilter("OPEN")
            }
            className={`
              rounded-3xl
              p-3.5
              text-left
              transition-all

              ${
                activeFilter === "OPEN"
                  ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20"
                  : "border border-slate-200 bg-white text-slate-900"
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
                mt-3
                text-lg
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
              rounded-3xl
              p-3.5
              text-left
              transition-all

              ${
                activeFilter ===
                "ACCEPTED"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "border border-slate-200 bg-white text-slate-900"
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
              Dikerjakan
            </p>

            <h2
              className="
                mt-3
                text-lg
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
              rounded-3xl
              p-3.5
              text-left
              transition-all

              ${
                activeFilter ===
                "COMPLETED"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "border border-slate-200 bg-white text-slate-900"
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
                mt-3
                text-lg
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

        {/* TASK LIST */}
        <div className="mt-7 space-y-4">

          {loading ? (
            <div>
              Memuat task...
            </div>
          ) : tasks.length === 0 ? (
            <div
              className="
                rounded-4xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Belum ada task
              </h3>

              <p className="mt-3 text-sm text-slate-500">
                Buat task kamu sekarang.
              </p>

            </div>
          ) : (
            tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="
                  block
                  rounded-4xl
                  border
                  border-slate-100
                  bg-white
                  p-5
                  shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                  transition-all
                  duration-300
                  active:scale-[0.98]
                "
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

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
                    text-lg
                    font-black
                    leading-8
                    tracking-tight
                    text-slate-900
                  "
                >
                  {task.title}
                </h2>

                {/* BOTTOM */}
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                  "
                >

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    📍 {task.address}
                  </p>

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
            ))
          )}

        </div>

      </div>

      <MobileBottomNavbar />

    </main>
  );
}