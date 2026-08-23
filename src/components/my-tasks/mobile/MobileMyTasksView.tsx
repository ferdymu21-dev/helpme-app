"use client";

import Link from "next/link";

import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileMyTasksView({
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
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* HEADER */}
<div>
  <div className="relative flex h-10 items-center">
    {/* BACK TO HOME */}
    <Link
      href="/home"
      aria-label="Kembali ke halaman utama"
      className="
        relative
        z-10
        inline-flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        bg-white
        text-slate-700
        shadow-sm
        transition
        hover:bg-slate-50
        active:scale-95
      "
    >
      <ArrowLeft
        className="h-5 w-5"
        strokeWidth={2}
      />
    </Link>

    {/* TITLE */}
    <h1
      className="
        pointer-events-none
        absolute
        left-1/2
        -translate-x-1/2
        whitespace-nowrap
        text-base
        font-black
        tracking-tight
        text-slate-900
      "
    >
      Task Saya
    </h1>
  </div>

  {/* DESCRIPTION */}
  <p
    className="
      mt-4
      text-center
      text-xs
      leading-5
      text-slate-500
    "
  >
    Kelola task, lihat pelamar, dan pantau progress task kamu.
  </p>
</div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-4 gap-1">
          {/* OPEN */}
          <button
            onClick={() => setActiveFilter("OPEN")}
            className={`
              rounded-3xl
              p-3.5
              text-left
              transition-all
              ${
                activeFilter === "OPEN"
                  ? "bg-linear-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                  : "border border-slate-200 bg-white text-slate-900"
              }
            `}
          >
            <p
              className={`
    text-xs
    font-semibold
    ${activeFilter === "OPEN" ? "text-emerald-100" : "text-slate-500"}
  `}
            >
              Aktif
            </p>

            <div className="mt-3 flex items-center gap-2">
              <img
                src="/icons/tasks/owner-aktif.svg"
                alt="Aktif"
                className={`
                  h-8
                  w-8
                  ${activeFilter === "OPEN" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-lg font-black">{openCount}</h2>
            </div>
          </button>

          {/* ACCEPTED */}
          <button
            onClick={() => setActiveFilter("ACCEPTED")}
            className={`
              rounded-3xl
              p-3.5
              text-left
              transition-all
              ${
                activeFilter === "ACCEPTED"
                  ? "bg-linear-to-br from-violet-500 to-violet-400 text-white shadow-lg shadow-violet-500/20"
                  : "border border-slate-200 bg-white text-slate-900"
              }
            `}
          >
            <p
              className={`
    text-xs
    font-semibold
    ${activeFilter === "ACCEPTED" ? "text-violet-100" : "text-slate-500"}
  `}
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
                  ${activeFilter === "ACCEPTED" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-lg font-black">{acceptedCount}</h2>
            </div>
          </button>

          {/* WAITING CONFIRMATION */}
          <button
            onClick={() => setActiveFilter("WAITING_CONFIRMATION")}
            className={`
    rounded-3xl
    p-3.5
    text-left
    transition-all
    ${
      activeFilter === "WAITING_CONFIRMATION"
        ? "bg-linear-to-br from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20"
        : "border border-slate-200 bg-white text-slate-900"
    }
  `}
          >
            <p
              className={`
    text-xs
    font-semibold
    ${
      activeFilter === "WAITING_CONFIRMATION"
        ? "text-amber-100"
        : "text-slate-500"
    }
  `}
            >
              Konfirmasi
            </p>

            <div className="mt-3 flex items-center gap-2">
              <img
                src="/icons/tasks/menunggu-konfirmasi.svg"
                alt="menunggu-konfirmasi"
                className={`
                  h-8
                  w-8
                  ${activeFilter === "WAITING_CONFIRMATION" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-lg font-black">{waitingConfirmationCount}</h2>
            </div>
          </button>

          {/* COMPLETED */}
          <button
            onClick={() => setActiveFilter("COMPLETED")}
            className={`
              rounded-3xl
              p-3.5
              text-left
              transition-all
              ${
                activeFilter === "COMPLETED"
                  ? "bg-linear-to-br from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/20"
                  : "border border-slate-200 bg-white text-slate-900"
              }
            `}
          >
            <p
              className={`
    text-xs
    font-semibold
    ${activeFilter === "COMPLETED" ? "text-blue-100" : "text-slate-500"}
  `}
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
                  ${activeFilter === "COMPLETED" ? "brightness-0 invert" : ""}
                `}
              />

              <h2 className="text-lg font-black">{completedCount}</h2>
            </div>
          </button>
        </div>

        {/* TASK LIST */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <div>Memuat task...</div>
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
              <h3 className="text-lg font-bold text-slate-900">
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
                  {/* CATEGORY */}
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

                  {/* URGENT + STATUS */}
                  <div className="flex items-center gap-2">
                    {task.is_urgent && (
                      <div
                        className="
          rounded-full
          bg-red-100
          px-2
          py-1
          text-[10px]
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
        text-[10px]
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
                <div className="mt-3 flex items-start justify-between gap-4">
                  {/* LOCATION + SCHEDULE */}
                  <div className="min-w-0 flex-1">
                    {/* LOCATION */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />

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
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />

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
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock3 className="h-3.5 w-3.5 shrink-0" />

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
                  </div>

                  {/* PRICE */}
                  <div
                    className="
      shrink-0
      whitespace-nowrap
      text-base
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
      <MobileBottomNavbar />
    </main>
  );
}