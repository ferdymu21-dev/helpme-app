"use client";

import Image from "next/image";

import Link from "next/link";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

interface Props {
  tasks: NearbyTask[];

  loadingTasks: boolean;

  locationError: string | null;

  activeCategory: string;

  currentPage: number;

  totalPages: number;

  onCategoryChange: (category: string) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

export default function MobileTaskFeed({
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
    <section className="px-6 pt-8 pb-20">
      <div className="mx-auto max-w-300">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="
                text-sm
                font-black
                leading-tight
                tracking-tight
                text-slate-900
              "
            >
              Task Terbaru
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Temukan task di sekitar kamu
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div
          className="
            mt-3
            flex
            gap-3
            overflow-x-auto
            whitespace-nowrap
            pb-2
            scrollbar-hide
          "
        >
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
              onClick={() => onCategoryChange(item.label)}
              className={`
                shrink-0
                whitespace-nowrap
                rounded-2xl
                px-3
                py-2
                text-xs
                font-semibold
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5

                ${
                  activeCategory === item.label
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={14}
                  height={14}
                  className={
                    activeCategory === item.label ? "brightness-0 invert" : ""
                  }
                />

                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* =========================
            TASK FEED STATE
        ========================= */}

        {locationError ? (
          /*
           * KONDISI 1
           * Lokasi Helper tidak tersedia.
           */
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
              p-4
              text-xs
              text-amber-700
            "
          >
            {locationError}
          </div>
        ) : loadingTasks ? (
          /*
           * KONDISI 2
           * RPC sedang mengambil nearby task.
           */
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-xs
              text-slate-500
            "
          >
            Memuat task di sekitar kamu...
          </div>
        ) : tasks.length === 0 ? (
          /*
           * KONDISI 3
           * Query berhasil tetapi tidak
           * menemukan task.
           */
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-xs
              text-slate-500
            "
          >
            Belum ada task yang tersedia di sekitar kamu.
          </div>
        ) : (
          /*
           * KONDISI 4
           * Nearby task tersedia.
           */
          <>
            {/* TASK LIST */}
            <div className="mt-3.5 space-y-2.5">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="
                    block
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    p-2
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
                        bg-indigo-100
                        ml-2
                        mt-1
                        px-2
                        py-1
                        text-[9px]
                        font-semibold
                        text-indigo-700
                      "
                    >
                      {task.category}
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center gap-2">
                      {task.is_urgent && (
                        <div
                          className="
                            rounded-full
                            bg-red-100
                            -ml-5
                            mt-1
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
                        className="
                          rounded-full
                          bg-emerald-50
                          mt-1
                          px-2
                          py-1
                          text-[9px]
                          font-semibold
                          text-emerald-500
                        "
                      >
                        {task.status}
                      </div>
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3
                    className="
                      mt-3
                      ml-3.5
                      text-sm
                      font-black
                      leading-5
                      tracking-tight
                      text-slate-900
                    "
                  >
                    {task.title}
                  </h3>

                  {/* BOTTOM */}
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div className="space-y-2">
                      {/* LOCATION */}
                      <p
                        className="
                          ml-3.5
                          text-[11px]
                          text-slate-500
                        "
                      >
                        📍{" "}
                        {(() => {
                          const location =
                            task.location_type === "SEARCH"
                              ? task.location_name || "Lokasi tidak tersedia"
                              : task.manual_address || "Alamat manual";

                          return location.length > 20
                            ? `${location.slice(0, 20)}...`
                            : location;
                        })()}
                      </p>

                      {/* SCHEDULE */}
                      {task.scheduled_at && (
                        <p
                          className="ml-3.5 text-[10px] text-slate-400">
                          📅{" "}
                          {new Date(task.scheduled_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                          {" • "}
                          🕒{" "}
                          {new Date(task.scheduled_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}

                      {/* DISTANCE */}
                      <p
                        className="
                          ml-3.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        🛵 {task.distance_km.toFixed(1)} km dari kamu
                      </p>
                    </div>

                    {/* PRICE */}
                    <div
                      className="
                        relative
                        right-3.5
                        text-base
                        font-black
                        tracking-tight
                        text-green-500
                      "
                    >
                      Rp
                      {task.budget.toLocaleString("id-ID")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={onPreviousPage}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Sebelumnya
                </button>

                <span className="text-[11px] text-slate-500">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={onNextPage}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2
                    text-xs
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