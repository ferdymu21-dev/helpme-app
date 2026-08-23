"use client";

import Link from "next/link";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

interface Props {
  tasks: NearbyTask[];

  loadingTasks: boolean;

  locationError: string | null;

  activeCategory: string;

  currentPage: number;

  totalPages: number;

  onCategoryChange: (
    category: string,
  ) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

function getCategoryIcon(
  category: string,
) {
  switch (category) {
    case "Antri":
      return "/icons/antri.svg";

    case "Dokumen":
      return "/icons/dokumen.svg";

    case "Kondangan":
      return "/icons/kondangan.svg";

    case "Kurir":
      return "/icons/kurir.svg";

    case "Belanja":
      return "/icons/belanja.svg";

    default:
      return "/icons/lainnya.svg";
  }
}

export default function TaskFeed({
  tasks,
  loadingTasks,
  locationError,
  activeCategory,
  currentPage,
  totalPages,
  onCategoryChange,
  onPreviousPage,
  onNextPage,
}: Props) {
  return (
    <section className="px-8 pt-8 pb-20">
      <div className="mx-auto max-w-300">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Task Terbaru
            </h2>

            <p className="mt-2 text-slate-500">
              Temukan task di sekitar kamu
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-6 flex flex-wrap gap-3 pb-0 scrollbar-hide">
          {[
            {
              label: "Semua",
              icon: "/icons/semua.svg",
            },
            {
              label: "Antri",
              icon: "/icons/antri.svg",
            },
            {
              label: "Dokumen",
              icon: "/icons/dokumen.svg",
            },
            {
              label: "Kondangan",
              icon: "/icons/kondangan.svg",
            },
            {
              label: "Kurir",
              icon: "/icons/kurir.svg",
            },
            {
              label: "Belanja",
              icon: "/icons/belanja.svg",
            },
            {
              label: "Lainnya",
              icon: "/icons/lainnya.svg",
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                onCategoryChange(
                  item.label,
                )
              }
              className={`
                flex
                items-center
                gap-2
                whitespace-nowrap
                rounded-full
                px-4
                py-1
                text-sm
                font-semibold
                transition
                hover:-translate-y-0.5

                ${
                  activeCategory ===
                  item.label
                    ? "bg-indigo-500 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              <img
                src={item.icon}
                alt={item.label}
                className={`
                  h-3
                  w-3

                  ${
                    activeCategory ===
                    item.label
                      ? "brightness-0 invert"
                      : ""
                  }
                `}
              />

              {item.label}
            </button>
          ))}
        </div>

        {/* =========================
            TASK FEED STATE
        ========================= */}

        {locationError ? (
          /*
           * KONDISI 1:
           * Browser tidak memberikan lokasi.
           */
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
              p-6
              text-sm
              text-amber-700
            "
          >
            {locationError}
          </div>
        ) : loadingTasks ? (
          /*
           * KONDISI 2:
           * Lokasi tersedia tetapi RPC
           * sedang mengambil task.
           */
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              text-sm
              text-slate-500
            "
          >
            Memuat task di sekitar kamu...
          </div>
        ) : tasks.length === 0 ? (
          /*
           * KONDISI 3:
           * RPC berhasil tetapi tidak ada
           * task yang memenuhi filter/radius.
           */
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              text-sm
              text-slate-500
            "
          >
            Belum ada task yang tersedia di
            sekitar kamu.
          </div>
        ) : (
          /*
           * KONDISI 4:
           * Task tersedia.
           */
          <>
            {/* TASK GRID */}
            <div className="mt-8 grid grid-cols-4 gap-6">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="
                    group
                    rounded-[28px]
                    border
                    border-slate-200
                    bg-white
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-indigo-200
                    hover:shadow-xl
                  "
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between">
                    <div>
                      {/* CATEGORY */}
                      <div
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-indigo-100
                          px-3
                          py-1
                          text-[10px]
                          font-semibold
                          text-indigo-600
                        "
                      >
                        <img
                          src={getCategoryIcon(
                            task.category,
                          )}
                          alt={
                            task.category
                          }
                          className="h-3 w-3"
                        />

                        {task.category}
                      </div>

                      {task.is_urgent && (
                        <div
                          className="
                            mt-2
                            inline-flex
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

                      {/* TITLE */}
                      <h3
                        className="
                          mt-4
                          text-lg
                          leading-8
                          font-bold
                          tracking-tight
                          text-slate-900
                          transition
                          hover:-translate-y-0.5
                          group-hover:text-indigo-600
                        "
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          rounded-full
                          bg-emerald-50
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                          text-emerald-500
                        "
                      >
                        {task.status}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="mt-7 space-y-4">
                    {/* LOCATION */}
                    <p className="text-xs text-slate-500">
                      📍{" "}
                      {(() => {
                        const location =
                          task.location_type ===
                          "SEARCH"
                            ? task.location_name ||
                              "Lokasi tidak tersedia"
                            : task.manual_address ||
                              "Alamat manual";

                        return location.length >
                          20
                          ? `${location.slice(
                              0,
                              20,
                            )}...`
                          : location;
                      })()}
                    </p>

                    {/* SCHEDULE */}
                    {task.scheduled_at && (
                      <p className="text-xs text-slate-500">
                        📅{" "}
                        {new Date(
                          task.scheduled_at,
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}

                        {" • "}

                        🕒{" "}
                        {new Date(
                          task.scheduled_at,
                        ).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    )}

                    {/* DISTANCE */}
                    <p className="text-xs text-slate-400">
                      🛵{" "}
                      {task.distance_km.toFixed(
                        1,
                      )}{" "}
                      km dari kamu
                    </p>

                    {/* PRICE */}
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
                        "id-ID",
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={
                    currentPage <= 1
                  }
                  onClick={
                    onPreviousPage
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Sebelumnya
                </button>

                <span className="text-sm text-slate-500">
                  Halaman {currentPage} dari{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={onNextPage}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Berikutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}