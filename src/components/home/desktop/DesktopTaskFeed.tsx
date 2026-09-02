"use client";

import Link from "next/link";

import { getTaskCategoryDefinition } from "@/features/tasks/constants/task-categories";

import { TASK_FEED_FILTERS } from "@/features/tasks/constants/task-feed-filters";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Flame,
  Inbox,
  LoaderCircle,
  MapPin,
  Navigation,
  Search,
  Sparkles,
} from "lucide-react";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

interface Props {
  tasks: NearbyTask[];

  loadingTasks: boolean;

  locationError: string | null;

  activeCategory: string;

  searchValue: string;

  currentPage: number;

  totalPages: number;

  onCategoryChange: (category: string) => void;

  onSearchChange: (value: string) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

function getTaskLocation(task: NearbyTask) {
  if (task.location_type === "SEARCH") {
    return task.location_name || "Lokasi tidak tersedia";
  }

  return task.manual_address || "Alamat manual";
}

function getStatusLabel(status: string) {
  switch (status) {
    case "OPEN":
      return "Terbuka";

    case "COMPLETED":
      return "Selesai";

    case "CANCELLED":
      return "Dibatalkan";

    case "EXPIRED":
      return "Kedaluwarsa";

    default:
      return status;
  }
}

export default function DesktopTaskFeed({
  tasks,
  loadingTasks,
  locationError,
  activeCategory,
  searchValue,
  currentPage,
  totalPages,
  onCategoryChange,
  onSearchChange,
  onPreviousPage,
  onNextPage,
}: Props) {
  return (
    <section className="px-8 pt-9 pb-20 xl:px-10">
      <div className="mx-auto max-w-360">
        {/* HEADER */}
        <div className="flex items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" strokeWidth={2} />

              <p
                className="
                  text-xs
                  font-black
                  tracking-wide
                  text-slate-500
                  uppercase
                "
              >
                Jelajahi Task
              </p>
            </div>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Task di Sekitarmu
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Temukan kesempatan untuk membantu pengguna di dekat lokasi Anda.
            </p>
          </div>

          <div className="w-full max-w-sm shrink-0">
            <label htmlFor="desktop-task-search" className="sr-only">
              Cari task
            </label>

            <div className="relative">
              <Search
                className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        h-4
        w-4
        -translate-y-1/2
        text-slate-400
      "
                strokeWidth={2}
              />

              <input
                id="desktop-task-search"
                type="search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari task, kebutuhan, atau lokasi..."
                className="
        h-11
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        pl-11
        pr-4
        text-sm
        font-medium
        text-slate-800
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-indigo-300
        focus:ring-4
        focus:ring-indigo-100/70
      "
              />
            </div>

            <div
              className="
      mt-2
      flex
      items-center
      justify-end
      gap-1.5
      text-[10px]
      font-semibold
      text-slate-400
    "
            >
              <Navigation className="h-3 w-3 text-indigo-500" strokeWidth={2} />
              Berdasarkan lokasi Anda
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {TASK_FEED_FILTERS.map((item) => {
            const active = activeCategory === item.value;

            const Icon = item.icon;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onCategoryChange(item.value)}
                className={`
                  inline-flex
                  min-h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  text-xs
                  font-bold
                  transition
                  duration-200
                  active:scale-[0.98]

                  ${
                    active
                      ? item.value === "Mendesak"
                        ? `
        border-rose-600
        bg-rose-600
        text-white
        shadow-[0_6px_16px_rgba(225,29,72,0.18)]
      `
                        : `
        border-indigo-600
        bg-indigo-600
        text-white
        shadow-[0_6px_16px_rgba(79,70,229,0.18)]
      `
                      : item.value === "Mendesak"
                        ? `
        border-rose-200
        bg-rose-50/60
        text-rose-600
        hover:border-rose-300
        hover:bg-rose-50
      `
                        : `
        border-slate-200
        bg-white
        text-slate-600
        hover:border-indigo-200
        hover:bg-indigo-50/50
        hover:text-indigo-700
      `
                  }
                `}
              >
                <Icon
                  className="
                        h-3.5
                        w-3.5
                        "
                  strokeWidth={2}
                />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* LOCATION ERROR */}
        {locationError ? (
          <div
            className="
              mt-7
              flex
              items-start
              gap-4
              rounded-3xl
              border
              border-amber-200
              bg-amber-50
              p-5
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-amber-100
                text-amber-700
              "
            >
              <CircleAlert className="h-5 w-5" strokeWidth={2} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-black
                  text-amber-900
                "
              >
                Lokasi belum tersedia
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-amber-700
                "
              >
                {locationError}
              </p>
            </div>
          </div>
        ) : loadingTasks ? (
          /* LOADING */
          <div
            className="
              mt-7
              grid
              grid-cols-2
              gap-5
              xl:grid-cols-3
              2xl:grid-cols-4
            "
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  min-h-80
                  animate-pulse
                  rounded-[26px]
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div className="h-7 w-20 rounded-full bg-slate-100" />

                  <div className="h-7 w-16 rounded-full bg-slate-100" />
                </div>

                <div className="mt-6 h-5 w-4/5 rounded bg-slate-100" />

                <div className="mt-2 h-5 w-2/3 rounded bg-slate-100" />

                <div className="mt-5 h-3 w-full rounded bg-slate-100" />

                <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />

                <div className="mt-7 space-y-3">
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>

                <div className="mt-8 h-7 w-28 rounded bg-slate-100" />
              </div>
            ))}

            <div
              className="
                col-span-full
                flex
                items-center
                justify-center
                gap-2
                py-2
                text-xs
                font-medium
                text-slate-400
              "
            >
              <LoaderCircle
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />
              Memuat task di sekitar Anda...
            </div>
          </div>
        ) : tasks.length === 0 ? (
          /* EMPTY */
          <div
            className="
              mt-7
              flex
              min-h-56
              flex-col
              items-center
              justify-center
              rounded-[28px]
              border
              border-dashed
              border-slate-300
              bg-white
              px-8
              text-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-500
              "
            >
              <Inbox className="h-5 w-5" strokeWidth={2} />
            </div>

            <h3
              className="
                mt-4
                text-base
                font-black
                text-slate-900
              "
            >
              Belum ada task tersedia
            </h3>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
              "
            >
              Belum ada task yang sesuai dengan kategori dan area Anda saat ini.
              Coba kategori lainnya.
            </p>
          </div>
        ) : (
          <>
            {/* TASK GRID */}
            <div
              className="
                mt-7
                grid
                grid-cols-2
                gap-5
                xl:grid-cols-3
                2xl:grid-cols-4
              "
            >
              {tasks.map((task) => {
                const location = getTaskLocation(task);

                const category = getTaskCategoryDefinition(task.category);

                const CategoryIcon = category.icon;

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className={`
    group
    relative
    flex
    min-h-80
    flex-col
    overflow-hidden
    rounded-[26px]
    border
    p-5
    transition
    duration-300
    hover:-translate-y-1

    ${
      task.is_urgent
        ? `
          border-rose-200
          bg-linear-to-br
          from-rose-50/80
          via-white
          to-white
          shadow-[0_10px_28px_rgba(225,29,72,0.07)]
          hover:border-rose-300
          hover:shadow-[0_18px_40px_rgba(225,29,72,0.12)]
        `
        : `
          border-slate-200
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
          hover:border-indigo-200
          hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]
        `
    }
  `}
                  >
                    {/* TOP */}
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          inline-flex
                          h-7
                          items-center
                          gap-1.5
                          rounded-full
                          bg-indigo-50
                          px-2.5
                          text-[9px]
                          font-bold
                          text-indigo-700
                        "
                      >
                        <CategoryIcon className="h-3 w-3" strokeWidth={2} />

                        {category.label}
                      </div>

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          justify-end
                          gap-1.5
                        "
                      >
                        {task.is_urgent && (
                          <span
                            className="
                              inline-flex
                              h-7
                              items-center
                              gap-1.5
                              rounded-full
                              bg-red-100
                              px-2.5
                              text-[9px]
                              font-black
                              text-red-700
                            "
                          >
                            <Flame className="h-3 w-3" strokeWidth={2.2} />
                            Mendesak
                          </span>
                        )}

                        <span
                          className="
                            inline-flex
                            h-7
                            items-center
                            rounded-full
                            bg-emerald-50
                            px-2.5
                            text-[9px]
                            font-bold
                            text-emerald-700
                          "
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>

                    {/* TITLE */}
                    <h3
                      className="
                        mt-5
                        line-clamp-2
                        text-lg
                        font-black
                        leading-7
                        tracking-tight
                        text-slate-950
                        transition
                        group-hover:text-indigo-600
                      "
                    >
                      {task.title}
                    </h3>

                    {/* META */}
                    <div
                      className="
    mt-5
    space-y-2.5
    border-t
    border-slate-100
    pt-4
  "
                    >
                      {/* LOCATION */}
                      <div
                        className="
      flex
      min-w-0
      items-center
      gap-2
      text-xs
      text-slate-500
    "
                      >
                        <MapPin
                          className="
        h-3.5
        w-3.5
        shrink-0
        text-slate-400
      "
                          strokeWidth={2}
                        />

                        <span className="truncate">{location}</span>
                      </div>

                      {/* SCHEDULE */}
                      {task.scheduled_at && (
                        <div
                          className="
        flex
        items-center
        gap-3
        text-[11px]
        text-slate-500
      "
                        >
                          <span
                            className="
          inline-flex
          items-center
          gap-1.5
        "
                          >
                            <CalendarDays
                              className="
            h-3.5
            w-3.5
            text-slate-400
          "
                              strokeWidth={2}
                            />

                            {new Date(task.scheduled_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              className="h-3.5 w-3.5 text-slate-400"
                              strokeWidth={2}
                            />

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

                      {/* DISTANCE */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Navigation
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                        />
                        {task.distance_km.toFixed(1)} km dari kamu
                      </div>
                    </div>

                    {/* PRICE */}
                    <div
                      className="
                        mt-auto
                        flex
                        items-end
                        justify-between
                        gap-4
                        pt-6
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            text-slate-400
                          "
                        >
                          Budget
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-xl
                            font-black
                            tracking-tight
                            text-emerald-600
                          "
                        >
                          Rp
                          {task.budget.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-50
                          text-slate-400
                          transition
                          group-hover:bg-indigo-50
                          group-hover:text-indigo-600
                        "
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                className="
                  mt-9
                  flex
                  items-center
                  justify-center
                  gap-4
                "
              >
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={onPreviousPage}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-slate-600
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>

                <div
                  className="
                    rounded-xl
                    bg-slate-100
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  Halaman {currentPage} dari {totalPages}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={onNextPage}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-slate-600
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}