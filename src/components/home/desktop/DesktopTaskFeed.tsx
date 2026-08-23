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

function getCategoryIcon(
  category: string
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

          {
            [
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
            ]
              .map((item, index) => (
                <button
                  key={item.label}
                  onClick={() =>
                    setActiveCategory(item.label)
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

    ${activeCategory === item.label
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

      ${activeCategory === item.label
                        ? "brightness-0 invert"
                        : ""
                      }
    `}
                  />

                  {item.label}

                </button>
              ))}

        </div>

        {/* TASK GRID */}
        <div className="mt-8 grid grid-cols-4 gap-6">

          {filteredTasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="
                group
                rounded-[28px]
                borgroup
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
                        task.category
                      )}
                      alt={task.category}
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
                <p
                  className="
                    text-xs
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

                {task.scheduled_at && (

                  <p
                    className="
      text-xs
      text-slate-500
    "
                  >

                    📅 {

                      new Date(
                        task.scheduled_at
                      ).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )

                    }

                    {" • "}

                    🕒 {

                      new Date(
                        task.scheduled_at
                      ).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )

                    }

                  </p>

                )}

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
        text-xs
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
              </div>

            </Link>
          ))}

        </div>

      </div>

    </section>
  );
}