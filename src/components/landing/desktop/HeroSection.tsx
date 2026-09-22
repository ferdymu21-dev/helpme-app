import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import LandingHeroVisual from "../shared/LandingHeroVisual";

import styles from "../shared/LandingHeroMotion.module.css";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Profil & verifikasi",
    description:
      "Informasi pengguna membantu membangun kepercayaan.",
  },
  {
    icon: MessageCircle,
    title: "Chat & kesepakatan",
    description:
      "Diskusikan kebutuhan dan detail pekerjaan langsung.",
  },
  {
    icon: MapPin,
    title: "Berbasis lokasi",
    description:
      "Temukan bantuan yang relevan dengan kebutuhanmu.",
  },
];

export default function HeroSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-b
        border-slate-100
        bg-white
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[54%]
          top-20
          h-100
          w-100
          rounded-full
          bg-indigo-100/60
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-8
          pb-10
          pt-14
          xl:px-10
        "
      >
        <div
          className="
            grid
            min-h-140
            grid-cols-[0.94fr_1.06fr]
            items-center
            gap-14
          "
        >
          <div className="relative z-10">
            <div
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-indigo-100
                bg-indigo-50
                px-4
                py-2
                text-[11px]
                font-black
                uppercase
                tracking-[0.08em]
                text-indigo-700
                ${styles.heroEnter}
              `}
            >
              <MapPin
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2.2}
              />

              Platform bantuan & jasa sehari-hari
            </div>

            <h1
              className={`
                mt-6
                max-w-2xl
                text-5xl
                font-black
                leading-[1.04]
                tracking-[-0.045em]
                text-slate-950
                xl:text-[58px]
                ${styles.heroEnterDelayed}
              `}
            >
              Bantuan sehari-hari,{" "}
              <span className="text-indigo-600">
                lebih mudah ditemukan.
              </span>
            </h1>

            <p
              className={`
                mt-6
                max-w-xl
                text-base
                leading-8
                text-slate-500
                xl:text-[17px]
                ${styles.heroEnterMoreDelayed}
              `}
            >
              Buat permintaan bantuan atau temukan jasa
              yang siap membantu kebutuhanmu. Dari antre,
              antar jemput, titip ambil, hingga aktivitas
              sehari-hari lainnya.
            </p>

            <div
              className={`
                mt-8
                flex
                flex-wrap
                items-center
                gap-3
                ${styles.heroEnterMoreDelayed}
              `}
            >
              <Link
                href="/tasks/create"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-6
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
                Butuh Bantuan

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
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-6
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:-translate-y-0.5
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-700
                "
              >
                Cari Jasa
              </Link>
            </div>

            <Link
              href="/my-services/new"
              className={`
                mt-4
                inline-flex
                items-center
                gap-1.5
                text-sm
                font-bold
                text-indigo-600
                transition
                hover:gap-2.5
                hover:text-indigo-700
                ${styles.heroEnterMoreDelayed}
              `}
            >
              Punya waktu atau keahlian? Tawarkan Jasa

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Link>
          </div>

          <div
            className={`
              relative
              ${styles.heroEnterDelayed}
            `}
          >
            <LandingHeroVisual />
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-3
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_12px_40px_rgba(15,23,42,0.04)]
          "
        >
          {trustFeatures.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <div
                key={title}
                className="
                  flex
                  items-center
                  gap-3
                  border-r
                  border-slate-100
                  px-5
                  py-4
                  last:border-r-0
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <Icon
                    aria-hidden="true"
                    className="h-4.5 w-4.5"
                    strokeWidth={2}
                  />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-black
                      text-slate-900
                    "
                  >
                    {title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      leading-4
                      text-slate-500
                    "
                  >
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}