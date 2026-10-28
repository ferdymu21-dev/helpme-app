"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import {
  getTaskCategoryDefinition,
  getTaskCategoryHeroImage,
} from "@/features/tasks/constants/task-categories";

import { TASK_FEED_FILTERS } from "@/features/tasks/constants/task-feed-filters";

import {
  ArrowRight,
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
  ShieldAlert,
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
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const initialUpdate = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);

    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(intervalId);
    };
  }, []);
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
              "
            >
              {tasks.map((task) => {
                const location = getTaskLocation(task);

                const category = getTaskCategoryDefinition(task.category);

                const CategoryIcon = category.icon;

                const heroImage = getTaskCategoryHeroImage(task.category);

                if (task.is_emergency) {
                  const requestHref = `/siaga/emergency/${task.emergency_help_request_id ?? task.id}`;
                  const createdAt = new Date(task.created_at).getTime();
const elapsedMinutes = currentTime > 0 && Number.isFinite(createdAt)
                    ? Math.max(0, Math.floor((currentTime - createdAt) / 60000))
                    : 0;
                  const timeAgo =
                    elapsedMinutes < 1
                      ? "Baru saja"
                      : elapsedMinutes < 60
                        ? `${elapsedMinutes} menit lalu`
                        : elapsedMinutes < 1440
                          ? `${Math.floor(elapsedMinutes / 60)} jam lalu`
                          : `${Math.floor(elapsedMinutes / 1440)} hari lalu`;
                  const distanceLabel = !Number.isFinite(task.distance_km)
                    ? "Jarak tidak tersedia"
                    : task.distance_km < 1
                      ? `${Math.round(task.distance_km * 1000)} m dari kamu`
                      : `${task.distance_km.toLocaleString("id-ID", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })} km dari kamu`;

                  return (
                    <Link
                      key={task.id}
                      href={requestHref}
                      aria-label={`Lihat permintaan bantuan: ${task.title}`}
                      className="block w-full text-left relative min-w-0 overflow-hidden rounded-[20px] border border-rose-100 border-l-4 border-l-rose-500 bg-linear-to-br from-white via-white to-rose-50/70 p-3.5 shadow-[0_8px_24px_rgba(225,29,72,0.07)] transition-colors hover:border-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:p-4"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500 shadow-sm">
                            <ShieldAlert
                              className="h-4 w-4 text-white"
                              strokeWidth={2.2}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white sm:text-[11px]">
                            HelpMe Siaga
                          </span>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-semibold text-amber-700 sm:text-[10px]">
                          <Clock3 className="h-3 w-3" aria-hidden="true" />
                          Menunggu bantuan
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-[15px] font-extrabold leading-5 tracking-tight text-slate-900 sm:text-base">
                        {task.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600 sm:text-xs">
                        {task.description || "Seseorang membutuhkan bantuan di sekitar lokasi ini."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-600 sm:text-[11px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <MapPin
                            className="h-3.5 w-3.5 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          <span>Lokasi sekitar</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3
                            className="h-3.5 w-3.5 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          {timeAgo}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Navigation
                            className="h-3.5 w-3.5 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          {distanceLabel}
                        </span>
                      </div>

                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-2.5 py-2 text-[10px] leading-4 text-rose-600 sm:text-[11px]">
                        <CircleAlert
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          Untuk kondisi yang mengancam nyawa, hubungi layanan darurat resmi.
                        </span>
                      </div>

                    </Link>
                  );
                }

                return (
                  <Link
                    key={task.id}
                    href={task.is_emergency ? `/siaga/emergency/${task.emergency_help_request_id ?? task.id}` : `/tasks/${task.id}`}
                    className={`
                      group
                      flex
                      min-h-64
                      min-w-0
                      overflow-hidden
                      rounded-[26px]
                      border
                      bg-white
                      shadow-[0_10px_30px_rgba(15,23,42,0.055)]
                      transition
                      duration-300
                      hover:-translate-y-0.5

                      ${
                        task.is_emergency || task.is_urgent
                          ? `
                              border-rose-200
                              hover:border-rose-300
                              hover:shadow-[0_16px_38px_rgba(225,29,72,0.10)]
                            `
                          : `
                              border-slate-200/80
                              hover:border-indigo-200
                              hover:shadow-[0_16px_38px_rgba(79,70,229,0.10)]
                            `
                      }
                    `}
                  >
                    {/* COVER */}
                    <div
                      className="
                        relative
                        m-3
                        mr-0
                        w-48
                        shrink-0
                        overflow-hidden
                        rounded-[20px]
                        bg-slate-100
                      "
                    >
                      <Image
                        src={heroImage}
                        alt={`Kategori ${category.label}`}
                        fill
                        sizes="192px"
                        className="
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-[1.025]
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-linear-to-t
                          from-slate-950/45
                          via-transparent
                          to-transparent
                        "
                      />

                      {task.is_urgent && (
                        <span
                          className="
                            absolute
                            top-3
                            left-3
                            inline-flex
                            h-7
                            items-center
                            gap-1.5
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

                      <div
                        className="
                          absolute
                          right-3
                          bottom-3
                          left-3
                        "
                      >
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-white/60
                            bg-white/90
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-bold
                            text-slate-700
                            shadow-sm
                            backdrop-blur-md
                          "
                        >
                          <CategoryIcon
                            className="
                              h-3
                              w-3
                              text-indigo-600
                            "
                            strokeWidth={2}
                          />

                          {category.label}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        p-5
                      "
                    >
                      {/* STATUS */}
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
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

                      {task.is_emergency && (
                        <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm">
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          BANTUAN DARURAT
                        </span>
                      )}

                      {/* TITLE */}
                      <h3
                        className="
                          mt-3
                          line-clamp-2
                          text-[17px]
                          font-black
                          leading-6
                          tracking-tight
                          text-slate-950
                          transition
                          group-hover:text-indigo-700
                        "
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p
                          className="
                            mt-1.5
                            line-clamp-2
                            text-[11px]
                            leading-4.25
                            text-slate-500
                          "
                        >
                          {task.description}
                        </p>
                      )}

                      {/* META */}
                      <div
                        className="
                          mt-3
                          space-y-2
                        "
                      >
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            justify-between
                            gap-3
                            text-[10px]
                            text-slate-500
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
                                h-3.5
                                w-3.5
                                shrink-0
                                text-indigo-500
                              "
                              strokeWidth={2}
                            />

                            <span className="truncate">
                              {task.is_emergency ? "Lokasi sekitar" : location}
                            </span>
                          </span>

                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1
                            "
                          >
                            <Navigation
                              className="
                                h-3.5
                                w-3.5
                                text-indigo-500
                              "
                              strokeWidth={2}
                            />

                            {task.is_emergency && task.distance_km < 1
                              ? `${Math.round(task.distance_km * 1000)} m`
                              : `${task.distance_km.toFixed(1)} km`}
                            {task.is_emergency ? " dari kamu" : ""}
                          </span>
                        </div>

                        {task.scheduled_at && (
                          <div
                            className="
                              flex
                              items-center
                              gap-4
                              text-[10px]
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
                                  text-indigo-500
                                "
                                strokeWidth={2}
                              />

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

                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                              "
                            >
                              <Clock3
                                className="
                                  h-3.5
                                  w-3.5
                                  text-indigo-500
                                "
                                strokeWidth={2}
                              />

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
                        )}
                      </div>

                      {/* FOOTER */}
                      <div
                        className="
                          mt-auto
                          flex
                          items-end
                          justify-between
                          gap-4
                          border-t
                          border-slate-100
                          pt-4
                        "
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              text-[9px]
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
                              text-[19px]
                              font-black
                              tracking-tight
                              text-orange-600
                            "
                          >
                            {task.is_emergency ? "Bantuan warga" : <>Rp{task.budget.toLocaleString("id-ID")}</>}
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
                            px-3.5
                            py-2.5
                            text-[10px]
                            font-bold
                            text-white
                            shadow-[0_8px_18px_rgba(99,102,241,0.22)]
                          "
                        >
                          Lihat detail

                          <ArrowRight
                            className="
                              h-3.5
                              w-3.5
                              transition
                              group-hover:translate-x-0.5
                            "
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