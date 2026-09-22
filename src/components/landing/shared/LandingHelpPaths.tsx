import Link from "next/link";

import {
  ArrowRight,
  CirclePlus,
  Search,
} from "lucide-react";

const requestExamples = [
  "Antre",
  "Titip beli",
  "Ambil barang",
];

const serviceExamples = [
  "Jasa antre",
  "Antar jemput",
  "Titip ambil",
];

export default function LandingHelpPaths() {
  return (
    <section
      className="
        border-b
        border-slate-100
        bg-slate-50/60
        px-5
        py-7
        lg:px-8
        lg:py-20
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-indigo-600
              lg:text-xs
            "
          >
            Sesuaikan dengan kebutuhanmu
          </p>

          <h2
            className="
              mt-3
              text-2xl
              font-black
              leading-tight
              tracking-[-0.035em]
              text-slate-950
              sm:text-3xl
              lg:text-4xl
            "
          >
            Dua cara mendapatkan bantuan
            di HelpMe
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-slate-500
              lg:text-base
              lg:leading-7
            "
          >
            Buat task sesuai kebutuhanmu
            atau pilih jasa yang sudah ditawarkan
            oleh helper.
          </p>
        </div>

        <div
          className="
            mt-8
            grid
            gap-4
            lg:mt-12
            lg:grid-cols-2
            lg:gap-6
          "
        >
          {/* REQUEST HELP */}
          <article
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_12px_40px_rgba(15,23,42,0.04)]
              transition
              duration-300
              hover:-translate-y-1
              hover:border-indigo-200
              hover:shadow-[0_18px_55px_rgba(15,23,42,0.07)]
              lg:p-7
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-16
                -top-16
                h-40
                w-40
                rounded-full
                bg-indigo-50
              "
            />

            <div className="relative">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                  transition
                  duration-300
                  group-hover:scale-105
                  lg:h-12
                  lg:w-12
                "
              >
                <CirclePlus
                  aria-hidden="true"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  strokeWidth={2}
                />
              </div>

              <p
                className="
                  mt-5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-indigo-600
                "
              >
                Buat Permintaan
              </p>

              <h3
                className="
                  mt-1.5
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-950
                  lg:text-2xl
                "
              >
                Ceritakan apa yang perlu
                dibantu
              </h3>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                  lg:max-w-lg
                "
              >
                Cocok untuk kebutuhan yang
                spesifik. Tentukan detail,
                waktu, lokasi, dan anggaran,
                lalu temukan orang yang dapat
                membantu.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {requestExamples.map(
                  (example) => (
                    <span
                      key={example}
                      className="
                        rounded-lg
                        bg-slate-50
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        text-slate-500
                      "
                    >
                      {example}
                    </span>
                  ),
                )}
              </div>

              <Link
                href="/tasks/create"
                className="
                  mt-6
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
                  hover:bg-indigo-700
                  active:scale-[0.98]
                "
              >
                Buat Permintaan

                <ArrowRight
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                    transition
                    group-hover:translate-x-0.5
                  "
                  strokeWidth={2.2}
                />
              </Link>
            </div>
          </article>

          {/* FIND SERVICES */}
          <article
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_12px_40px_rgba(15,23,42,0.04)]
              transition
              duration-300
              hover:-translate-y-1
              hover:border-indigo-200
              hover:shadow-[0_18px_55px_rgba(15,23,42,0.07)]
              lg:p-7
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-16
                -top-16
                h-40
                w-40
                rounded-full
                bg-violet-50
              "
            />

            <div className="relative">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-50
                  text-violet-600
                  transition
                  duration-300
                  group-hover:scale-105
                  lg:h-12
                  lg:w-12
                "
              >
                <Search
                  aria-hidden="true"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  strokeWidth={2}
                />
              </div>

              <p
                className="
                  mt-5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-violet-600
                "
              >
                Cari Jasa
              </p>

              <h3
                className="
                  mt-1.5
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-950
                  lg:text-2xl
                "
              >
                Pilih jasa yang sudah
                tersedia
              </h3>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                  lg:max-w-lg
                "
              >
                Jelajahi jasa yang sudah
                ditawarkan penyedia, lihat
                detail layanannya, lalu kirim
                permintaan sesuai kebutuhanmu.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {serviceExamples.map(
                  (example) => (
                    <span
                      key={example}
                      className="
                        rounded-lg
                        bg-slate-50
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        text-slate-500
                      "
                    >
                      {example}
                    </span>
                  ),
                )}
              </div>

              <Link
                href="/services"
                className="
                  mt-6
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-700
                  active:scale-[0.98]
                "
              >
                Jelajahi Jasa

                <ArrowRight
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                    transition
                    group-hover:translate-x-0.5
                  "
                  strokeWidth={2.2}
                />
              </Link>
            </div>
          </article>
        </div>

        <p
          className="
            mx-auto
            mt-6
            max-w-xl
            text-center
            text-xs
            leading-5
            text-slate-400
          "
        >
          Tidak menemukan jasa yang sesuai?
          Kamu tetap bisa membuat permintaan
          bantuan dengan kebutuhanmu sendiri.
        </p>
      </div>
    </section>
  );
}