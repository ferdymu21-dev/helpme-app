"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

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

  scheduled_at?: string | null;

  is_urgent?: boolean;
}

interface Props {
  tasks: Task[];
}

export default function MobileTaskFeed({
  tasks,
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

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("Semua");

  const filteredTasks =

    (
      activeCategory ===
        "Semua"

        ? tasks

        : tasks.filter(
          (task) =>
            task.category ===
            activeCategory
        )
    )

      .sort((a, b) => {

        if (
          a.is_urgent &&
          !b.is_urgent
        ) {
          return -1;
        }

        if (
          !a.is_urgent &&
          b.is_urgent
        ) {
          return 1;
        }

        return 0;
      });

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
            pb-2
            scrollbar-hide
          "
        >

          {[
            "Semua",
            "Antri",
            "Dokumen",
            "Kondangan",
            "Kurir",
            "Belanja",
            "Lainnya",
          ].map((item, index) => (
            <button
              key={item}
              onClick={() =>
                setActiveCategory(item)
              }
              className={`
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

                ${activeCategory === item
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              {item}
            </button>
          ))}

        </div>

        {/* TASK LIST */}
        <div className="mt-2 space-y-2">

          {filteredTasks.map((task) => (
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

                        return location.length > 20
                          ? `${location.slice(0, 20)}...`
                          : location;

                      })()
                    }
                  </p>

                  {/* DISTANCE */}
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
                        ml-3.5
          text-[10px]
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

                </div>

                {/* PRICE */}
                <div
                  className="
                    relative
                    right-3.5
                    text-base
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

              </div>

            </Link>
          ))}

        </div>

      </div>

    </section>
  );
}