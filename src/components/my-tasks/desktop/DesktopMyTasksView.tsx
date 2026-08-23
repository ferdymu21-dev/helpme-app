"use client";

import Link from "next/link";

import { CalendarDays, Clock3, MapPin } from "lucide-react";

import {
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
} from "@/features/tasks/utils/task-status";

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

  scheduled_at?: string | null;
  is_urgent?: boolean;
}

interface Props {
  tasks: Task[];
  loading: boolean;
  activeFilter: string;

  setActiveFilter: (value: string) => void;

  openCount: number;
  acceptedCount: number;
  waitingConfirmationCount: number;
  completedCount: number;
}

export default function DesktopMyTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  openCount,
  acceptedCount,
  waitingConfirmationCount,
  completedCount,
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
      <div className="mx-auto max-w-7xl px-10 py-10">
        {/* HEADER */}
        <div className="flex items-end justify-between">
          <div>
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

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
              Kelola task, lihat pelamar, dan pantau progress task kamu.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-4 gap-5">
          {/* OPEN */}
          <button
            onClick={() => setActiveFilter("OPEN")}
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter === "OPEN"
                  ? "bg-linear-to-br from-emerald-500 to-emerald-400 text-white shadow-[0_20px_60px_rgba(16,185,129,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-emerald-200"
              }
            `}
          >
            <p
              className={
                activeFilter === "OPEN" ? "text-emerald-100" : "text-slate-500"
              }
            >
              Task Aktif
            </p>

            <div className="mt-3 flex items-center gap-5">
              <img
                src="/icons/tasks/owner-aktif.svg"
                alt="Aktif"
                className={`
                  h-20
                  w-20

                  ${activeFilter === "OPEN" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-6xl font-black">{openCount}</h2>
            </div>
          </button>

          {/* ACCEPTED */}
          <button
            onClick={() => setActiveFilter("ACCEPTED")}
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter === "ACCEPTED"
                  ? "bg-linear-to-br from-violet-500 to-violet-400 text-white shadow-[0_20px_60px_rgba(139,92,246,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-violet-200"
              }
            `}
          >
            <p
              className={
                activeFilter === "ACCEPTED"
                  ? "text-violet-100"
                  : "text-slate-500"
              }
            >
              Sedang Dikerjakan
            </p>

            <div className="mt-3 flex items-center gap-5">
              <img
                src="/icons/tasks/owner-dikerjakan.svg"
                alt="Dikerjakan"
                className={`
                  h-20
                  w-20

                  ${activeFilter === "ACCEPTED" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-6xl font-black">{acceptedCount}</h2>
            </div>
          </button>

          {/* WAITING CONFIRMATION */}
          <button
            onClick={() => setActiveFilter("WAITING_CONFIRMATION")}
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter === "WAITING_CONFIRMATION"
                  ? "bg-linear-to-br from-amber-500 to-amber-400 text-white shadow-[0_20px_60px_rgba(245,158,11,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-amber-200"
              }
            `}
          >
            <p
              className={
                activeFilter === "WAITING_CONFIRMATION"
                  ? "text-amber-100"
                  : "text-slate-500"
              }
            >
              Menunggu Konfirmasi
            </p>

            <div className="mt-3 flex items-center gap-5">
              <img
                src="/icons/tasks/menunggu-konfirmasi.svg"
                alt="Menunggu Konfirmasi"
                className={`
                  h-20
                  w-20

                  ${
                    activeFilter === "WAITING_CONFIRMATION"
                      ? "brightness-0 invert"
                      : ""
                  }
                `}
              />

              <h2 className="text-6xl font-black">
                {waitingConfirmationCount}
              </h2>
            </div>
          </button>

          {/* COMPLETED */}
          <button
            onClick={() => setActiveFilter("COMPLETED")}
            className={`
              rounded-4xl
              p-7
              text-left
              transition-all

              ${
                activeFilter === "COMPLETED"
                  ? "bg-linear-to-br from-blue-500 to-blue-400 text-white shadow-[0_20px_60px_rgba(59,130,246,0.25)]"
                  : "border border-slate-200 bg-white text-slate-900 hover:border-blue-200"
              }
            `}
          >
            <p
              className={
                activeFilter === "COMPLETED"
                  ? "text-blue-100"
                  : "text-slate-500"
              }
            >
              Selesai
            </p>

            <div className="mt-3 flex items-center gap-5">
              <img
                src="/icons/tasks/owner-selesai.svg"
                alt="Selesai"
                className={`
                  h-20
                  w-20

                  ${activeFilter === "COMPLETED" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-6xl font-black">{completedCount}</h2>
            </div>
          </button>
        </div>

        {/* TASK GRID */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          {loading ? (
            <div>Memuat task...</div>
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
              <h3 className="text-2xl font-bold text-slate-900">
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
                  flex
                  min-h-72
                  flex-col
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
                <div className="flex items-center justify-between gap-3">
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

                  {/* URGENT + STATUS */}
                  <div className="flex items-center gap-2">
                    {task.is_urgent && (
                      <div
                        className="
                          rounded-full
                          bg-red-100
                          px-3
                          py-1
                          text-xs
                          font-bold
                          text-red-600
                        "
                      >
                        🔥 Mendesak
                      </div>
                    )}

                    <div
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${getTaskStatusBadgeClass(task.status)}
                      `}
                    >
                      {getTaskStatusLabel(task.status)}
                    </div>
                  </div>
                </div>

                {/* TITLE */}
                <h2
                  className="
                    mt-5
                    line-clamp-2
                    text-2xl
                    font-black
                    leading-7
                    tracking-tight
                    text-slate-900
                    transition
                    group-hover:text-indigo-600
                  "
                >
                  {task.title}
                </h2>

                {/* BOTTOM */}
                <div className="mt-auto pt-8">
                  {/* LOCATION */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                    <span>
                      {(() => {
                        const location =
                          task.location_type === "SEARCH"
                            ? task.location_name || "Lokasi tidak tersedia"
                            : task.manual_address || "Alamat manual";

                        return location.length > 25
                          ? `${location.slice(0, 25)}.....`
                          : location;
                      })()}
                    </span>
                  </div>

                  {/* DATE */}
                  {task.scheduled_at && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        {new Date(task.scheduled_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {/* TIME */}
                  {task.scheduled_at && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        {new Date(task.scheduled_at).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {/* PRICE */}
                  <div
                    className="
      mt-3
      text-2xl
      font-black
      tracking-tight
      text-amber-500
    "
                  >
                    Rp
                    {task.budget.toLocaleString("id-ID")}
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