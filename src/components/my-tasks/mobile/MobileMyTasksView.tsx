"use client";

import Link from "next/link";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  location_type?: string;

  location_name?: string;

  manual_address?: string;

  latitude?: number;

  longitude?: number;

  owner_latitude?: number;

  owner_longitude?: number;
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
              text-xs
              font-semibold
              text-indigo-600
            "
          >
            Owner Dashboard
          </div>

          <h1
            className="
              mt-3
              text-base
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Task Saya
          </h1>

          <p
            className="
              mt-2
              text-xs
              leading-2
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

              ${activeFilter === "OPEN"
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

<div className="mt-3 flex items-center gap-2">

  <img
    src="/icons/tasks/owner-aktif.svg"
    alt="Task Aktif"
    className={`
      h-8
      w-8

      ${activeFilter === "OPEN"
        ? "brightness-0 invert"
        : ""
      }
    `}
  />

  <h2
    className="
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

</div>

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

              ${activeFilter ===
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
  Proses
</p>

<div className="mt-3 flex items-center gap-2">

  <img
    src="/icons/tasks/owner-dikerjakan.svg"
    alt="Dikerjakan"
    className={`
      h-8
      w-8

      ${activeFilter === "ACCEPTED"
        ? "brightness-0 invert"
        : ""
      }
    `}
  />

  <h2
    className="
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

</div>

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

              ${activeFilter ===
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

<div className="mt-3 flex items-center gap-2">

  <img
    src="/icons/tasks/owner-selesai.svg"
    alt="Selesai"
    className={`
      h-8
      w-8

      ${activeFilter === "COMPLETED"
        ? "brightness-0 invert"
        : ""
      }
    `}
  />

  <h2
    className="
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

</div>

          </button>

        </div>

        {/* TASK LIST */}
        <div className="mt-5 space-y-3">

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
                      text-[10px]
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
                      text-[10px]
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
                    mt-3
                    text-base
                    font-black
                    leading-3
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
                      text-[11px]
                    text-slate-500
                    "
                  >
                    📍 {

                      (() => {

                        const location =

                          task.location_type ===
                            "SEARCH"

                            ? (
                              task.location_name ||
                              "Lokasi tidak tersedia"
                            )

                            : (
                              task.manual_address ||
                              "Alamat manual"
                            );

                        return location.length > 22
                          ? `${location.slice(0, 22)}...`
                          : location;

                      })()
                    }
                  </p>

                  <div
                    className="
                      text-base
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