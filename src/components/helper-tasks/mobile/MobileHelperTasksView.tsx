"use client";

import Link from "next/link";

import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";

import { useEffect, useState } from "react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import { calculateDistance } from "@/lib/location/distance";

import { getTaskCategoryLabel } from "@/features/tasks/constants/task-categories";

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
  appliedCount: number;
  acceptedCount: number;
  waitingConfirmationCount: number;
  completedCount: number;
}

export default function MobileHelperTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  appliedCount,
  acceptedCount,
  waitingConfirmationCount,
  completedCount,
}: Props) {
  const [userLatitude, setUserLatitude] = useState<number | null>(null);

  const [userLongitude, setUserLongitude] = useState<number | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLatitude(position.coords.latitude);

      setUserLongitude(position.coords.longitude);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">
      {/* CONTAINER */}
      <div className="mx-auto max-w-5xl px-6 py-7">
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
      Task Helper
    </h1>
  </div>

  {/* SUBTITLE */}
  <p
    className="
      mt-4
      text-center
      text-xs
      leading-5
      text-slate-500
    "
  >
    Pantau tugas yang sedang kamu kerjakan.
  </p>
</div>

        {/* STATS */}
        <div className="mt-7 grid grid-cols-4 gap-1">
          {/* OPEN */}
          <button
            onClick={() => setActiveFilter("OPEN")}
            className={`
              rounded-3xl
              p-3.5
              text-left
              transition-all
              duration-300

              ${
                activeFilter === "OPEN"
                  ? "bg-linear-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                  : "border border-slate-200 bg-white"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`
                      text-xs
                      font-semibold

                      ${activeFilter === "OPEN" ? "text-emerald-100" : "text-slate-500"}
    `}
                >
                  Dilamar
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/icons/tasks/helper-dilamar.svg"
                    alt="Dilamar"
                    className={`
                      h-6
                      w-6
                      ${activeFilter === "OPEN" ? "brightness-0 invert" : ""}
                    `}
                  />

                  <h2 className="text-lg font-black">{appliedCount}</h2>
                </div>
              </div>
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
              duration-300

              ${
                activeFilter === "ACCEPTED"
                  ? "bg-linear-to-br from-violet-500 to-violet-400 text-white shadow-lg shadow-violet-500/20"
                  : "border border-slate-200 bg-white"
              }
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <p
                  className={`
      text-xs
      font-semibold

      ${activeFilter === "ACCEPTED" ? "text-indigo-100" : "text-slate-500"}
    `}
                >
                  Dikerjakan
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/icons/tasks/helper-dikerjakan.svg"
                    alt="Dikerjakan"
                    className={`
        h-6
        w-6

        ${activeFilter === "ACCEPTED" ? "brightness-0 invert" : ""}
      `}
                  />

                  <h2 className="text-lg font-black">{acceptedCount}</h2>
                </div>
              </div>
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
    duration-300

    ${
      activeFilter === "WAITING_CONFIRMATION"
        ? "bg-linear-to-br from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20"
        : "border border-slate-200 bg-white"
    }
  `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`
                     text-xs
                     font-semibold
                     ${
                       activeFilter === "WAITING_CONFIRMATION"
                         ? "text-violet-100"
                         : "text-slate-500"
                     }
                  `}
                >
                  Konfirmasi
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/icons/tasks/helper-konfirmasi.svg"
                    alt="konfirmasi"
                    className={`
                       h-6
                       w-6
                       ${activeFilter === "WAITING_CONFIRMATION" ? "brightness-0 invert" : ""}
                    `}
                  />
                  <h2 className="text-lg font-black">
                    {waitingConfirmationCount}
                  </h2>
                </div>
              </div>
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
              duration-300

              ${
                activeFilter === "COMPLETED"
                  ? "bg-linear-to-br from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/20"
                  : "border border-slate-200 bg-white"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`
                    text-xs 
                    font-semibold
                    ${
                      activeFilter === "COMPLETED"
                        ? "text-amber-100"
                        : "text-slate-500"
                    }
                     `}
                >
                  Selesai
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/icons/tasks/helper-selesai.svg"
                    alt="Selesai"
                    className={`
        h-6
        w-6

        ${activeFilter === "COMPLETED" ? "brightness-0 invert" : ""}
      `}
                  />

                  <h2 className="text-lg font-black">{completedCount}</h2>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* TASK LIST */}
        <div className="mt-7 space-y-2.5">
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

              <p className="mt-1 text-sm text-slate-500">
                Kamu belum melamar task.
              </p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <Link
                key={`${task.id}-${index}`}
                href={`/tasks/${task.id}`}
                className="
                  block
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  px-3
                  py-1
                  shadow-sm
                  transition-all
                  duration-200
                  active:scale-[0.99]
                "
              >
                {/* TOP */}
                <div className="flex items-center justify-between">
                  {/* CATEGORY */}
                  <div
                    className="
                      mt-4
                      inline-flex
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      text-emerald-600
                    "
                  >
                    {getTaskCategoryLabel(task.category)}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.is_urgent && (
                      <div
                        className="
                        mt-4
                       
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
    mt-4
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
                    mt-1
                    p-1
                    line-clamp-2
                    text-base
                    font-black
                    leading-5
                    tracking-tight
                    text-slate-900
                  "
                >
                  {task.title}
                </h2>

                {/* LOCATION */}
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                  <span>
                    {(() => {
                      const location =
                        task.location_type === "SEARCH"
                          ? task.location_name || "Lokasi tidak tersedia"
                          : task.manual_address || "Alamat manual";

                      return location.length > 25
                        ? `${location.slice(0, 25)}...`
                        : location;
                    })()}
                  </span>
                </div>

                {/* SCHEDULE */}
                {task.scheduled_at && (
                  <div className="mt-1 space-y-1">
                    {/* DATE */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />

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

                    {/* TIME */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

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
                  </div>
                )}

                {/* DISTANCE + PRICE */}
                {(() => {
                  const taskLatitude = task.latitude ?? task.owner_latitude;

                  const taskLongitude = task.longitude ?? task.owner_longitude;

                  const canCalculateDistance =
                    userLatitude !== null &&
                    userLongitude !== null &&
                    taskLatitude != null &&
                    taskLongitude != null;

                  return (
                    <div className="mt-1 flex items-center justify-between gap-3">
                      {/* DISTANCE */}
                      <div className="min-w-0 p-3 flex-1">
                        {canCalculateDistance && (
                          <p className="truncate text-[11px] text-slate-400">
                            🛵{" "}
                            {calculateDistance(
                              userLatitude,
                              userLongitude,
                              taskLatitude,
                              taskLongitude,
                            ).toFixed(1)}{" "}
                            km dari kamu
                          </p>
                        )}
                      </div>

                      {/* PRICE */}
                      <div className="shrink-0 whitespace-nowrap text-xl font-black tracking-tight text-green-500">
                        Rp
                        {task.budget.toLocaleString("id-ID")}
                      </div>
                    </div>
                  );
                })()}
              </Link>
            ))
          )}
        </div>
      </div>

      <MobileBottomNavbar />
    </main>
  );
}