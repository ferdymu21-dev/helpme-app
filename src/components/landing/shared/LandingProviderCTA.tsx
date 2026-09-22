import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  MapPin,
  Sparkles,
} from "lucide-react";

const providerBenefits = [
  "Atur detail jasa yang kamu tawarkan",
  "Tentukan harga dan cakupan layanan",
  "Kelola permintaan jasa dari satu tempat",
];

const serviceExamples = [
  "Jasa Antre",
  "Antar Jemput",
  "Titip Ambil",
];

export default function LandingProviderCTA() {
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
            border
            border-indigo-100
            bg-indigo-50
            lg:rounded-[36px]
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
              bg-indigo-200/50
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
              bg-violet-200/40
              blur-3xl
            "
          />

          <div
            className="
              relative
              grid
              gap-8
              p-5
              sm:p-6
              lg:grid-cols-[1fr_0.9fr]
              lg:items-center
              lg:gap-12
              lg:p-10
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
                  border-indigo-200
                  bg-white/80
                  px-3
                  py-1.5
                "
              >
                <Sparkles
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-600
                  "
                  strokeWidth={2.2}
                />

                <span
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-indigo-700
                  "
                >
                  Tawarkan Jasa
                </span>
              </div>

              <h2
                className="
                  mt-5
                  max-w-2xl
                  text-2xl
                  font-black
                  leading-[1.13]
                  tracking-[-0.04em]
                  text-slate-950
                  sm:text-3xl
                  lg:text-[42px]
                "
              >
                Punya waktu atau kemampuan
                yang bisa membantu orang lain?
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-600
                  lg:text-base
                  lg:leading-7
                "
              >
                Tawarkan jasa untuk kebutuhan
                sehari-hari dan buat layananmu
                lebih mudah ditemukan oleh orang
                yang membutuhkan bantuan.
              </p>

              <div
                className="
                  mt-6
                  space-y-3
                "
              >
                {providerBenefits.map(
                  (benefit) => (
                    <div
                      key={benefit}
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <span
                        className="
                          mt-0.5
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-indigo-600
                          text-white
                        "
                      >
                        <Check
                          aria-hidden="true"
                          className="h-3 w-3"
                          strokeWidth={2.5}
                        />
                      </span>

                      <p
                        className="
                          text-xs
                          leading-5
                          text-slate-600
                          lg:text-sm
                        "
                      >
                        {benefit}
                      </p>
                    </div>
                  ),
                )}
              </div>

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
                  href="/my-services/new"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:bg-indigo-700
                    active:translate-y-0
                  "
                >
                  Tawarkan Jasa

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
                    rounded-xl
                    border
                    border-indigo-200
                    bg-white/70
                    px-5
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-white
                    hover:text-indigo-700
                    active:scale-[0.98]
                  "
                >
                  Lihat Jasa Lain
                </Link>
              </div>
            </div>

            {/* PROVIDER VISUAL */}
            <div
              className="
                relative
                mx-auto
                w-full
                max-w-md
              "
            >
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/70
                  bg-white
                  p-4
                  shadow-[0_24px_70px_rgba(79,70,229,0.16)]
                  sm:p-5
                  lg:rounded-4xl
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-indigo-600
                        text-white
                      "
                    >
                      <BriefcaseBusiness
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-black
                          text-slate-900
                        "
                      >
                        Jasa Saya
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-500
                        "
                      >
                        Kelola layananmu di HelpMe
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      rounded-full
                      bg-indigo-50
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-indigo-600
                    "
                  >
                    Provider
                  </span>
                </div>

                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-widest
                      text-slate-400
                    "
                  >
                    Contoh layanan
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {serviceExamples.map(
                      (service) => (
                        <span
                          key={service}
                          className="
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            py-1.5
                            text-[10px]
                            font-bold
                            text-slate-600
                          "
                        >
                          {service}
                        </span>
                      ),
                    )}
                  </div>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >
                    <div
                      className="
                        rounded-xl
                        bg-white
                        p-3
                      "
                    >
                      <MapPin
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                          text-indigo-600
                        "
                        strokeWidth={2}
                      />

                      <p
                        className="
                          mt-2
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-400
                        "
                      >
                        Area
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          font-bold
                          text-slate-700
                        "
                      >
                        Sesuai layanan
                      </p>
                    </div>

                    <div
                      className="
                        rounded-xl
                        bg-white
                        p-3
                      "
                    >
                      <CalendarDays
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                          text-indigo-600
                        "
                        strokeWidth={2}
                      />

                      <p
                        className="
                          mt-2
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-400
                        "
                      >
                        Jadwal
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          font-bold
                          text-slate-700
                        "
                      >
                        Kamu yang atur
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-3
                    rounded-2xl
                    bg-indigo-950
                    px-4
                    py-3.5
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      leading-5
                      text-indigo-100
                    "
                  >
                    Ubah waktu dan kemampuanmu
                    menjadi bantuan yang bernilai
                    bagi orang lain.
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="
                  absolute
                  -bottom-3
                  -left-3
                  -z-10
                  h-full
                  w-full
                  rounded-[28px]
                  bg-indigo-200/50
                  lg:rounded-4xl
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}