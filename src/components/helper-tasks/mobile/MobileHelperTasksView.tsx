"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import {
  calculateDistance,
} from "@/lib/location/distance";

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

  is_urgent?: boolean;
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

export default function MobileHelperTasksView({
  tasks,
  loading,
  activeFilter,
  setActiveFilter,
  filters,
}: Props) {

  const [
    userLatitude,
    setUserLatitude,
  ] = useState<
    number | null
  >(null);

  const [
    userLongitude,
    setUserLongitude,
  ] = useState<
    number | null
  >(null);

  useEffect(() => {

    navigator.geolocation
      .getCurrentPosition(
        (position) => {

          setUserLatitude(
            position.coords.latitude
          );

          setUserLongitude(
            position.coords.longitude
          );
        }
      );

  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

      {/* CONTAINER */}
      <div className="mx-auto max-w-5xl px-6 py-7">

        {/* HEADER */}
        <div>

          {/* BADGE */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-emerald-50
              px-4
              py-2
              text-xs
              font-semibold
              text-emerald-600
            "
          >
            🛠️ Helper Dashboard
          </div>

          {/* TITLE */}
          <h1
            className="
              mt-5
              text-xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Task Helper
          </h1>

          {/* SUBTITLE */}
          <p
            className="
              mt-2
              text-sm
              leading-5
              text-slate-500
            "
          >
            Pantau tugas yang sedang
            kamu kerjakan.
          </p>

        </div>

        {/* STATS */}
        <div
          className="
            mt-7
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
              duration-300

              ${activeFilter === "OPEN"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
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

      ${activeFilter ===
                      "OPEN"
                      ? "text-emerald-100"
                      : "text-slate-500"
                    }
    `}
                >
                  Dilamar
                </p>

                <div className="mt-3 flex items-center gap-2">

                  <img
                    src="/icons/tasks/helper-dilamar.svg"
                    alt="Dilamar"
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
        text-2xl
        font-black
      "
                  >
                    {
                      tasks.filter(
                        (task) =>
                          task.status ===
                          "OPEN"
                      ).length
                    }
                  </h2>

                </div>

              </div>

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
              duration-300

              ${activeFilter ===
                "ACCEPTED"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
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

      ${activeFilter ===
        "ACCEPTED"
        ? "text-indigo-100"
        : "text-slate-500"
      }
    `}
  >
    Dikerjakan
  </p>

  <div className="mt-3 flex items-center gap-2">

    <img
      src="/icons/tasks/helper-dikerjakan.svg"
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
        text-2xl
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

</div>

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
              duration-300

              ${activeFilter ===
                "COMPLETED"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
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

      ${activeFilter ===
        "COMPLETED"
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
        text-2xl
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

</div>

            </div>

          </button>

        </div>

        {/* TASK LIST */}
        <div className="mt-7 space-y-2.5">

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
                    mt-2
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
                    {task.category}
                  </div>

                  <div className="flex items-center gap-2">

                    {task.is_urgent && (

                      <div
                        className="
                        mt-2
                       
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
                      mt-2
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
                    mt-3
                    p-2
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
                <p
                  className="
    mt-2
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

                {
                  userLatitude &&
                  userLongitude &&
                  (
                    task.latitude ||
                    task.owner_latitude
                  ) &&
                  (
                    task.longitude ||
                    task.owner_longitude
                  ) && (

                    <p
                      className="
        mt-2
        text-[11px]
        text-slate-400
      "
                    >

                      🛵 {

                        calculateDistance(

                          userLatitude,

                          userLongitude,

                          task.latitude ||
                          task.owner_latitude!,

                          task.longitude ||
                          task.owner_longitude!
                        )
                          .toFixed(1)

                      } km dari kamu

                    </p>
                  )}

                {/* PRICE */}
                <div
                  className="
                    p-2
                    flex
                    justify-end
                    text-xl
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

              </Link>
            ))
          )}

        </div>

      </div>

      <MobileBottomNavbar />

    </main>
  );
}