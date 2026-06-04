"use client";

import Link from "next/link";

import BottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileHelperTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  filters,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

      {/* CONTAINER */}
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* HEADER */}
        <div>

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

          <h1
            className="
              mt-5
              text-3xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Task Helper
          </h1>

          <p
            className="
              mt-3
              text-base
              leading-7
              text-slate-500
            "
          >
            Pantau task yang kamu lamar
            dan task yang sedang
            dikerjakan.
          </p>

        </div>

        {/* STATS */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">

          {/* APPLIED */}
          <div
            className="
              min-w-40
              rounded-3xl
              bg-linear-to-br
              from-emerald-500
              to-green-600
              p-5
              text-white
              shadow-lg
              shadow-emerald-500/20
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-emerald-100
              "
            >
              Dilamar
            </p>

            <h2
              className="
                mt-3
                text-4xl
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
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              Dikerjakan
            </p>

            <h2
              className="
                mt-3
                text-4xl
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
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              Selesai
            </p>

            <h2
              className="
                mt-3
                text-4xl
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
            mt-7
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
                px-4
                py-2.5
                text-sm
                font-semibold
                transition-all
                duration-200

                ${
                  activeFilter === filter
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "border border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              {filter}
            </button>
          ))}

        </div>

        {/* TASKS */}
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
                Kamu belum melamar task.
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
                    text-xl
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
                      text-2xl
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

      <BottomNavbar />

    </main>
  );
}