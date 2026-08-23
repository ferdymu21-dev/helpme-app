"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { calculateDistance } from "@/lib/location/distance";

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
  filters: string[];
}

export default function DesktopHelperTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  filters,
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
    <main
      className="
        hidden
        min-h-screen
        bg-slate-50
        lg:block
      "
    >
      {/* CONTAINER */}
      <div className="mx-auto max-w-7xl px-10 py-8">
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          {/* LEFT */}
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-emerald-50
                px-4
                py-2
                text-sm
                font-semibold
                text-emerald-600
              "
            >
              🛠️ Helper Dashboard
            </div>

            <h1
              className="
                mt-5
                text-4xl
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
                text-slate-500
              "
            >
              Pantau task yang sedang kamu kerjakan.
            </p>
          </div>

          {/* RIGHT */}
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            {/* SEARCH */}
            <div
              className="
                flex
                h-12
                w-80
                items-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
              "
            >
              <span className="text-slate-400">🔍</span>

              <input
                type="text"
                placeholder="Cari task..."
                className="
                  ml-3
                  w-full
                  bg-transparent
                  text-sm
                  outline-none
                  placeholder:text-slate-400
                "
              />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div
          className="
            mt-8
            grid
            grid-cols-3
            gap-4
          "
        >
          {/* OPEN */}
          <button
            onClick={() => setActiveFilter("OPEN")}
            className={`
              group
              rounded-3xl
              border
              p-5
              text-left
              transition-all
              duration-300

              ${
                activeFilter === "OPEN"
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-emerald-200"
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
                    text-sm
                    font-medium

                    ${
                      activeFilter === "OPEN"
                        ? "text-emerald-100"
                        : "text-slate-500"
                    }
                  `}
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
                  {tasks.filter((task) => task.status === "OPEN").length}
                </h2>
              </div>

              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  text-2xl

                  ${activeFilter === "OPEN" ? "bg-white/20" : "bg-emerald-50"}
                `}
              >
                📨
              </div>
            </div>
          </button>

          {/* ACCEPTED */}
          <button
            onClick={() => setActiveFilter("ACCEPTED")}
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition-all
              duration-300

              ${
                activeFilter === "ACCEPTED"
                  ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-indigo-200"
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
                    text-sm
                    font-medium

                    ${
                      activeFilter === "ACCEPTED"
                        ? "text-indigo-100"
                        : "text-slate-500"
                    }
                  `}
                >
                  Dikerjakan
                </p>

                <h2
                  className="
                    mt-3
                    text-4xl
                    font-black
                  "
                >
                  {tasks.filter((task) => task.status === "ACCEPTED").length}
                </h2>
              </div>

              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  text-2xl

                  ${
                    activeFilter === "ACCEPTED" ? "bg-white/20" : "bg-indigo-50"
                  }
                `}
              >
                ⚡
              </div>
            </div>
          </button>

          {/* COMPLETED */}
          <button
            onClick={() => setActiveFilter("COMPLETED")}
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition-all
              duration-300

              ${
                activeFilter === "COMPLETED"
                  ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "border-slate-200 bg-white hover:border-amber-200"
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
                    text-sm
                    font-medium

                    ${
                      activeFilter === "COMPLETED"
                        ? "text-amber-100"
                        : "text-slate-500"
                    }
                  `}
                >
                  Selesai
                </p>

                <h2
                  className="
                    mt-3
                    text-4xl
                    font-black
                  "
                >
                  {tasks.filter((task) => task.status === "COMPLETED").length}
                </h2>
              </div>

              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  text-2xl

                  ${
                    activeFilter === "COMPLETED" ? "bg-white/20" : "bg-amber-50"
                  }
                `}
              >
                ✅
              </div>
            </div>
          </button>
        </div>

        {/* TASK GRID */}
        <div
          className="
            mt-8
            grid
            grid-cols-3
            gap-5
          "
        >
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
              <h3
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                Belum ada task
              </h3>

              <p className="mt-4 text-slate-500">Kamu belum melamar task.</p>
            </div>
          ) : (
            [...tasks]

              .sort((a, b) => {
                if (a.is_urgent && !b.is_urgent) {
                  return -1;
                }

                if (!a.is_urgent && b.is_urgent) {
                  return 1;
                }

                return 0;
              })

              .map((task, index) => (
                <Link
                  key={`${task.id}-${index}`}
                  href={`/tasks/${task.id}`}
                  className="
                  group
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-xl
                "
                >
                  {/* TOP */}
                  <div
                    className="
                    flex
                    items-center
                    justify-between
                  "
                  >
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
                        className="
      rounded-full
      bg-indigo-50
      px-3
      py-1
      text-[10px]
      font-semibold
      text-indigo-500
    "
                      >
                        {task.status}
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
                    leading-9
                    tracking-tight
                    text-slate-900
                    transition
                    group-hover:text-emerald-600
                  "
                  >
                    {task.title}
                  </h2>

                  {/* LOCATION */}
                  <p
                    className="
                    mt-6
                    text-sm
                    text-slate-500
                  "
                  >
                    📍{" "}
                    {(() => {
                      const location =
                        task.location_type === "SEARCH"
                          ? task.location_name || "Lokasi tidak tersedia"
                          : task.manual_address || "Alamat manual";

                      return location.length > 24
                        ? `${location.slice(0, 24)}...`
                        : location;
                    })()}
                  </p>

                  {task.scheduled_at && (
                    <p
                      className="
      mt-2
      text-sm
      text-slate-500
    "
                    >
                      📅{" "}
                      {new Date(task.scheduled_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" • "}
                      🕒{" "}
                      {new Date(task.scheduled_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  {userLatitude &&
                    userLongitude &&
                    (task.latitude || task.owner_latitude) &&
                    (task.longitude || task.owner_longitude) && (
                      <p
                        className="
        mt-3
        text-sm
        text-slate-400
      "
                      >
                        🛵{" "}
                        {calculateDistance(
                          userLatitude,

                          userLongitude,

                          task.latitude || task.owner_latitude!,

                          task.longitude || task.owner_longitude!,
                        ).toFixed(1)}{" "}
                        km dari kamu
                      </p>
                    )}

                  {/* BOTTOM */}
                  <div
                    className="
                    mt-6
                    flex
                    items-center
                    justify-between
                  "
                  >
                    {/* PRICE */}
                    <div
                      className="
                      text-3xl
                      font-black
                      tracking-tight
                      text-amber-500
                    "
                    >
                      Rp
                      {task.budget.toLocaleString("id-ID")}
                    </div>

                    {/* ACTION */}
                    <div
                      className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      transition
                      group-hover:bg-emerald-50
                    "
                    >
                      →
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