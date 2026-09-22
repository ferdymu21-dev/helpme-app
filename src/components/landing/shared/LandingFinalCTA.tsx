import Link from "next/link";

import {
  ArrowRight,
  HandHeart,
  Search,
  Sparkles,
} from "lucide-react";

export default function LandingFinalCTA() {
  return (
    <section
      className="
        bg-white
        px-4
        py-7
        sm:px-5
        lg:px-8
        lg:py-20
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-indigo-950
            px-5
            py-7
            sm:px-6
            lg:rounded-[36px]
            lg:px-10
            lg:py-12
          "
        >
          {/* DECORATION */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-indigo-500/20
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              -bottom-24
              left-1/3
              h-56
              w-56
              rounded-full
              bg-violet-500/15
              blur-3xl
            "
          />

          <div
            className="
              relative
              grid
              gap-8
              lg:grid-cols-[1fr_0.85fr]
              lg:items-center
              lg:gap-14
            "
          >
            {/* CONTENT */}
            <div>
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-1.5
                "
              >
                <Sparkles
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-300
                  "
                  strokeWidth={2.2}
                />

                <span
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-indigo-300
                  "
                >
                  Mulai dari sini
                </span>
              </div>

              <h2
                className="
                  mt-5
                  max-w-2xl
                  text-2xl
                  font-black
                  leading-[1.12]
                  tracking-[-0.04em]
                  text-white
                  sm:text-3xl
                  lg:text-[44px]
                "
              >
                Ada yang perlu dibantu
                hari ini?
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-400
                  lg:text-base
                  lg:leading-7
                "
              >
                Mulai dari kebutuhan sederhana
                di sekitar kamu. Buat permintaan
                sendiri atau cari jasa yang
                sudah tersedia di HelpMe.
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-2.5
                  sm:flex-row
                "
              >
                <Link
                  href="/tasks/create"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    text-sm
                    font-black
                    text-indigo-700
                    shadow-lg
                    shadow-black/10
                    transition
                    hover:-translate-y-0.5
                    hover:bg-indigo-50
                    active:translate-y-0
                  "
                >
                  <HandHeart
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  Buat Permintaan

                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />
                </Link>

                <Link
                  href="/services"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/15
                    bg-white/5
                    px-5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:border-white/25
                    hover:bg-white/10
                    active:scale-[0.98]
                  "
                >
                  <Search
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  Cari Jasa
                </Link>
              </div>
            </div>

            {/* CHOICE PANEL */}
            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-4
                backdrop-blur
                sm:p-5
                lg:rounded-[28px]
              "
            >
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-indigo-300
                "
              >
                Pilih sesuai kebutuhan
              </p>

              <div className="mt-3 space-y-2.5">
                <Link
                  href="/tasks/create"
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/6
                    p-3.5
                    transition
                    hover:border-white/20
                    hover:bg-white/10
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-500
                        text-white
                      "
                    >
                      <HandHeart
                        aria-hidden="true"
                        className="h-4.5 w-4.5"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-black
                          text-white
                          sm:text-sm
                        "
                      >
                        Butuh bantuan spesifik?
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          leading-4
                          text-slate-400
                        "
                      >
                        Buat permintaan sendiri.
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                      shrink-0
                      text-slate-500
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-white
                    "
                  />
                </Link>

                <Link
                  href="/services"
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/6
                    p-3.5
                    transition
                    hover:border-white/20
                    hover:bg-white/10
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-indigo-600
                      "
                    >
                      <Search
                        aria-hidden="true"
                        className="h-4.5 w-4.5"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-black
                          text-white
                          sm:text-sm
                        "
                      >
                        Sudah tahu jasanya?
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          leading-4
                          text-slate-400
                        "
                      >
                        Jelajahi jasa yang tersedia.
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                      shrink-0
                      text-slate-500
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-white
                    "
                  />
                </Link>
              </div>

              <div
                className="
                  mt-4
                  border-t
                  border-white/10
                  pt-4
                "
              >
                <p
                  className="
                    text-[10px]
                    leading-5
                    text-slate-400
                  "
                >
                  Punya waktu atau kemampuan
                  yang ingin ditawarkan?
                </p>

                <Link
                  href="/my-services/new"
                  className="
                    mt-1.5
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-black
                    text-indigo-300
                    transition
                    hover:gap-2.5
                    hover:text-white
                  "
                >
                  Tawarkan Jasa

                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}