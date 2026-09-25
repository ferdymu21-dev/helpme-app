"use client";

import Image from "next/image";

import Link from "next/link";

import {
  getTaskCategoryDefinition,
  getTaskCategoryHeroImage,
} from "@/features/tasks/constants/task-categories";

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
  if (status === "OPEN") {
    return "Terbuka";
  }

  return status;
}

export default function MobileTaskFeed({
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
    <section
      className="
        px-5
        pt-7
        pb-16
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <div>
          <h2
            className="
              mt-1
              text-[12px]
              font-black
              tracking-tight
              text-slate-950
            "
          >
            Task di Sekitarmu
          </h2>

          <p className="mt-0.5 text-[10px] leading-2.5 text-slate-500">
            Temukan kesempatan terbaru di dekat Anda.
          </p>
        </div>

        {!loadingTasks && !locationError && tasks.length > 0 && (
          <div
            className="
                mb-0.5
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-indigo-50
                text-indigo-600
              "
          >
            <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className="mt-4">
        <label htmlFor="mobile-task-search" className="sr-only">
          Cari task
        </label>

        <div className="relative">
          <Search
            className="
        pointer-events-none
        absolute
        left-3.5
        top-1/2
        h-3.5
        w-3.5
        -translate-y-1/2
        text-slate-400
      "
            strokeWidth={2}
          />

          <input
            id="mobile-task-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari task, kebutuhan, atau lokasi..."
            className="
        h-10
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        pl-10
        pr-3
        text-[11px]
        font-medium
        text-slate-800
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-indigo-300
        focus:ring-4
        focus:ring-indigo-100/60
      "
          />
        </div>
      </div>

      {/* FILTER */}
      <div
        className="
          -mx-5
          mt-4
          flex
          gap-2
          overflow-x-auto
          px-5
          pb-2
          scrollbar-hide
          scrollbar-none
          [&::-webkit-scrollbar]:hidden
        "
      >
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
                min-h-9
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                text-[10px]
                font-bold
                transition
                active:scale-[0.97]

                ${
                  active
                    ? item.value === "Mendesak"
                      ? `
        border-rose-600
        bg-rose-600
        text-white
        shadow-sm
      `
                      : `
        border-indigo-600
        bg-indigo-600
        text-white
        shadow-sm
      `
                    : item.value === "Mendesak"
                      ? `
        border-rose-200
        bg-rose-50
        text-rose-600
      `
                      : `
        border-slate-200
        bg-white
        text-slate-600
      `
                }
              `}
            >
              <Icon className="h-3 w-3" strokeWidth={2} />

              {item.label}
            </button>
          );
        })}
      </div>

      {/* ERROR */}
      {locationError ? (
        <div
          className="
            mt-4
            flex
            items-start
            gap-3
            rounded-[20px]
            border
            border-amber-200
            bg-amber-50
            p-4
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-amber-100
              text-amber-700
            "
          >
            <CircleAlert className="h-4 w-4" strokeWidth={2} />
          </div>

          <div>
            <p
              className="
                text-xs
                font-black
                text-amber-900
              "
            >
              Lokasi belum tersedia
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-4
                text-amber-700
              "
            >
              {locationError}
            </p>
          </div>
        </div>
      ) : loadingTasks ? (
        /* LOADING */
        <div className="mt-4 space-y-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="
                min-h-52
                animate-pulse
                rounded-[22px]
                border
                border-slate-200
                bg-white
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div className="h-6 w-20 rounded-full bg-slate-100" />

                <div className="h-6 w-14 rounded-full bg-slate-100" />
              </div>

              <div className="mt-5 h-4 w-4/5 rounded bg-slate-100" />

              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />

              <div className="mt-5 h-3 w-full rounded bg-slate-100" />

              <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />

              <div
                className="
                  mt-6
                  flex
                  justify-between
                "
              >
                <div className="h-3 w-24 rounded bg-slate-100" />

                <div className="h-6 w-24 rounded bg-slate-100" />
              </div>
            </div>
          ))}

          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              pt-1
              text-[10px]
              text-slate-400
            "
          >
            <LoaderCircle
              className="
                h-3.5
                w-3.5
                animate-spin
              "
            />
            Memuat task...
          </div>
        </div>
      ) : tasks.length === 0 ? (
        /* EMPTY */
        <div
          className="
            mt-4
            flex
            min-h-44
            flex-col
            items-center
            justify-center
            rounded-[22px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            text-center
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-500
            "
          >
            <Inbox className="h-4 w-4" strokeWidth={2} />
          </div>

          <p
            className="
              mt-3
              text-xs
              font-black
              text-slate-900
            "
          >
            Belum ada task
          </p>

          <p
            className="
              mt-1
              max-w-60
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            Coba pilih kategori lainnya untuk menemukan task di area Anda.
          </p>
        </div>
      ) : (
        <>
          {/* TASK LIST */}
          <div className="mt-4 space-y-3">
            {tasks.map((task) => {
              const location = getTaskLocation(task);

              const category = getTaskCategoryDefinition(task.category);

              const CategoryIcon = category.icon;

              const heroImage = getTaskCategoryHeroImage(task.category);

              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`
                    group
                    block
                    overflow-hidden
                    rounded-[22px]
                    border
                    bg-white
                    shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                    transition
                    duration-200
                    active:scale-[0.985]

                    ${
                      task.is_urgent
                        ? `
                            border-rose-200
                            shadow-[0_12px_32px_rgba(225,29,72,0.08)]
                          `
                        : `
                            border-slate-200/80
                          `
                    }
                  `}
                >
                  {/* COVER */}
                  <div
                    className="
                      relative
                      h-32
                      overflow-hidden
                      bg-slate-100
                    "
                  >
                    <Image
                      src={heroImage}
                      alt={`Kategori ${category.label}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-[1.02]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-linear-to-t
                        from-slate-950/50
                        via-slate-950/5
                        to-transparent
                      "
                    />

                    {/* CATEGORY */}
                    <div
                      className="
                        absolute
                        top-3
                        left-3
                        inline-flex
                        h-7
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-white/70
                        bg-white/90
                        px-2.5
                        text-[9px]
                        font-bold
                        text-slate-700
                        shadow-sm
                        backdrop-blur-md
                      "
                    >
                      <CategoryIcon
                        className="h-3 w-3 text-indigo-600"
                        strokeWidth={2}
                      />

                      {category.label}
                    </div>

                    {/* STATUS */}
                    <div
                      className="
                        absolute
                        top-3
                        right-3
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      {task.is_urgent && (
                        <span
                          className="
                            inline-flex
                            h-7
                            items-center
                            gap-1
                            rounded-full
                            bg-rose-500
                            px-2.5
                            text-[9px]
                            font-black
                            text-white
                            shadow-sm
                          "
                        >
                          <Flame
                            className="h-3 w-3"
                            strokeWidth={2.2}
                          />

                          Mendesak
                        </span>
                      )}

                      <span
                        className="
                          inline-flex
                          h-7
                          items-center
                          rounded-full
                          border
                          border-white/70
                          bg-white/90
                          px-2.5
                          text-[9px]
                          font-bold
                          text-emerald-700
                          shadow-sm
                          backdrop-blur-md
                        "
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-3.5">
                    <h3
                      className="
                        line-clamp-2
                        text-[14px]
                        font-black
                        leading-4.5
                        tracking-tight
                        text-slate-950
                      "
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p
                        className="
                          mt-1
                          line-clamp-1
                          text-[9.5px]
                          leading-3.5
                          text-slate-500
                        "
                      >
                        {task.description}
                      </p>
                    )}

                    {/* META */}
                    <div
                      className="
                        mt-2.5
                        space-y-1.5
                      "
                    >
                      {/* LOCATION + DISTANCE */}
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          justify-between
                          gap-2
                          rounded-xl
                          bg-slate-50
                          px-2.5
                          py-1.5
                          text-[9px]
                          text-slate-600
                        "
                      >
                        <span
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                          "
                        >
                          <MapPin
                            className="
                              h-3
                              w-3
                              shrink-0
                              text-indigo-500
                            "
                            strokeWidth={2}
                          />

                          <span className="truncate">
                            {location}
                          </span>
                        </span>

                        <span
                          className="
                            inline-flex
                            shrink-0
                            items-center
                            gap-1
                            text-slate-500
                          "
                        >
                          <Navigation
                            className="
                              h-3
                              w-3
                              shrink-0
                              text-indigo-500
                            "
                            strokeWidth={2}
                          />

                          {task.distance_km.toFixed(
                            1,
                          )}{" "}
                          km dari kamu
                        </span>
                      </div>

                      {/* DATE + TIME */}
                      {task.scheduled_at && (
                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-1.5
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                              rounded-xl
                              bg-slate-50
                              px-2.5
                              py-1.5
                              text-[9px]
                              text-slate-600
                            "
                          >
                            <CalendarDays
                              className="
                                h-3
                                w-3
                                shrink-0
                                text-indigo-500
                              "
                              strokeWidth={2}
                            />

                            <span className="truncate">
                              {new Date(
                                task.scheduled_at,
                              ).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )}
                            </span>
                          </div>

                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                              rounded-xl
                              bg-slate-50
                              px-2.5
                              py-1.5
                              text-[9px]
                              text-slate-600
                            "
                          >
                            <Clock3
                              className="
                                h-3
                                w-3
                                shrink-0
                                text-indigo-500
                              "
                              strokeWidth={2}
                            />

                            <span>
                              {new Date(
                                task.scheduled_at,
                              ).toLocaleTimeString(
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
                    </div>

                    {/* FOOTER */}
                    <div
                      className="
                        mt-3
                        flex
                        items-end
                        justify-between
                        gap-3
                        border-t
                        border-slate-100
                        pt-3
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            text-[10px]
                            font-semibold
                            text-slate-400
                          "
                        >
                          Budget
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-[16px]
                            font-black
                            tracking-tight
                            text-green-500
                          "
                        >
                          Rp
                          {task.budget.toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>

                      <span
                        className="
                          inline-flex
                          shrink-0
                          items-center
                          gap-1.5
                          rounded-xl
                          bg-linear-to-r
                          from-indigo-600
                          via-violet-600
                          to-fuchsia-600
                          px-2.5
                          py-2
                          text-[9px]
                          font-bold
                          text-white
                          shadow-[0_8px_18px_rgba(99,102,241,0.24)]
                        "
                      >

                        <ChevronRight
                          className="h-3.5 w-3.5"
                          strokeWidth={2}
                        />
                      </span>
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
                mt-6
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={onPreviousPage}
                className="
                  inline-flex
                  h-9
                  items-center
                  gap-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[10px]
                  font-bold
                  text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Sebelumnya
              </button>

              <span
                className="
                  rounded-lg
                  bg-slate-100
                  px-2.5
                  py-2
                  text-[9px]
                  font-bold
                  text-slate-500
                "
              >
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={onNextPage}
                className="
                  inline-flex
                  h-9
                  items-center
                  gap-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[10px]
                  font-bold
                  text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Berikutnya
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}