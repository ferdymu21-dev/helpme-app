import Link from "next/link";

import {
  ArrowUpRight,
  ClipboardList,
  Plus,
} from "lucide-react";

export default function MobileQuickActions() {
  return (
    <section
      className="
        px-5
        pt-5
      "
    >
      <div
        className="
          mb-3
          flex
          items-center
          justify-between
        "
      >
        <p
          className="
            text-[10px]
            font-black
            tracking-wide
            text-slate-500
            uppercase
          "
        >
          Akses Cepat
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        {/* CREATE */}
        <Link
          href="/tasks/create"
          className="
            group
            relative
            min-h-32
            overflow-hidden
            rounded-[22px]
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            p-4
            text-white
            shadow-[0_10px_24px_rgba(79,70,229,0.18)]
            transition
            active:scale-[0.98]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -top-10
              -right-10
              h-28
              w-28
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              relative
              flex
              h-full
              flex-col
            "
          >
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
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/15
                "
              >
                <Plus
                  className="h-4 w-4"
                  strokeWidth={2.4}
                />
              </div>

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  text-indigo-100
                "
                strokeWidth={2}
              />
            </div>

            <div className="mt-auto pt-5">
              <h3
                className="
                  text-sm
                  font-black
                "
              >
                Butuh Bantuan?
              </h3>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-4
                  text-indigo-100
                "
              >
                Buat task dan temukan
                helper.
              </p>
            </div>
          </div>
        </Link>

        {/* MY TASKS */}
        <Link
          href="/my-tasks"
          className="
            group
            relative
            min-h-32
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-white
            p-4
            shadow-[0_8px_22px_rgba(15,23,42,0.04)]
            transition
            active:scale-[0.98]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -bottom-12
              h-28
              w-28
              rounded-full
              bg-amber-50
            "
          />

          <div
            className="
              relative
              flex
              h-full
              flex-col
            "
          >
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
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-50
                  text-amber-600
                "
              >
                <ClipboardList
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </div>

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  text-slate-300
                "
                strokeWidth={2}
              />
            </div>

            <div className="mt-auto pt-5">
              <h3
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Task Saya
              </h3>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-4
                  text-slate-500
                "
              >
                Pantau task dan pelamar
                Anda.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}