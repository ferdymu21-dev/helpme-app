import Link from "next/link";

import {
  ArrowUpRight,
  ClipboardList,
  Plus,
  Sparkles,
} from "lucide-react";

export default function DesktopQuickActions() {
  return (
    <section
      className="
        px-8
        pt-8
        xl:px-10
      "
    >
      <div className="mx-auto max-w-360">
        {/* SECTION HEADER */}
        <div
          className="
            mb-4
            flex
            items-end
            justify-between
            gap-6
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Sparkles
                className="
                  h-4
                  w-4
                  text-indigo-600
                "
                strokeWidth={2}
              />

              <p
                className="
                  text-xs
                  font-black
                  tracking-wide
                  text-slate-500
                  uppercase
                "
              >
                Akses Cepat
              </p>
            </div>

            <h2
              className="
                mt-2
                text-xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Mau melakukan apa?
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Buat permintaan bantuan
              atau kelola task yang sudah
              Anda buat.
            </p>
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >
          {/* CREATE TASK */}
          <Link
            href="/tasks/create"
            className="
              group
              relative
              overflow-hidden
              rounded-[28px]
              bg-linear-to-br
              from-indigo-600
              via-indigo-600
              to-violet-600
              p-6
              text-white
              shadow-[0_14px_34px_rgba(79,70,229,0.20)]
              transition
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_42px_rgba(79,70,229,0.25)]
            "
          >
            {/* DECORATION */}
            <div
              className="
                pointer-events-none
                absolute
                -top-20
                -right-14
                h-52
                w-52
                rounded-full
                bg-white/10
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-24
                -bottom-24
                h-40
                w-40
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                relative
                flex
                min-h-36
                items-start
                justify-between
                gap-8
              "
            >
              <div className="max-w-md">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/15
                    backdrop-blur
                  "
                >
                  <Plus
                    className="h-5 w-5"
                    strokeWidth={2.4}
                  />
                </div>

                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    tracking-tight
                  "
                >
                  Butuh Bantuan?
                </h3>

                <p
                  className="
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-indigo-100
                  "
                >
                  Buat task dan temukan
                  helper yang cocok untuk
                  membantu kebutuhan Anda.
                </p>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-indigo-600
                  shadow-sm
                  transition
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              >
                <ArrowUpRight
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </div>
            </div>
          </Link>

          {/* MY TASK */}
          <Link
            href="/my-tasks"
            className="
              group
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-6
              shadow-[0_10px_30px_rgba(15,23,42,0.04)]
              transition
              duration-300
              hover:-translate-y-0.5
              hover:border-indigo-200
              hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -bottom-20
                h-48
                w-48
                rounded-full
                bg-amber-50
              "
            />

            <div
              className="
                relative
                flex
                min-h-36
                items-start
                justify-between
                gap-8
              "
            >
              <div className="max-w-md">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-amber-50
                    text-amber-600
                  "
                >
                  <ClipboardList
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-950
                  "
                >
                  Task Saya
                </h3>

                <p
                  className="
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Pantau task, lihat
                  pelamar, dan pilih
                  helper dari satu tempat.
                </p>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  shadow-sm
                  transition
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                  group-hover:border-indigo-200
                  group-hover:text-indigo-600
                "
              >
                <ArrowUpRight
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}