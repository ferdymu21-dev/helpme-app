import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import LandingHeroVisual from "../shared/LandingHeroVisual";

import styles from "../shared/LandingHeroMotion.module.css";

export default function MobileHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-b
        border-slate-100
        bg-white
        px-5
        pb-10
        pt-6
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-24
          h-64
          w-64
          rounded-full
          bg-indigo-100/60
          blur-3xl
        "
      />

      <div className="relative">
        <div
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-indigo-100
            bg-indigo-50
            px-3
            py-2
            text-[10px]
            font-black
            uppercase
            tracking-[0.08em]
            text-indigo-700
            ${styles.heroEnter}
          `}
        >
          <MapPin
            aria-hidden="true"
            className="h-3.5 w-3.5"
            strokeWidth={2.2}
          />

          Bantuan & jasa di sekitarmu
        </div>

        <h1
          className={`
            mt-5
            max-w-md
            text-[32px]
            font-black
            leading-[1.08]
            tracking-[-0.04em]
            text-slate-950
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
            mt-4
            max-w-md
            text-sm
            leading-6
            text-slate-500
            ${styles.heroEnterMoreDelayed}
          `}
        >
          Buat permintaan bantuan atau temukan jasa yang
          siap membantu kebutuhanmu, mulai dari antre,
          antar jemput, titip ambil, hingga kebutuhan
          sehari-hari lainnya.
        </p>

        <div
          className={`
            mt-6
            grid
            grid-cols-2
            gap-2.5
            ${styles.heroEnterMoreDelayed}
          `}
        >
          <Link
            href="/tasks/create"
            className="
              flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              active:scale-[0.98]
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
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-bold
              text-slate-700
              transition
              active:scale-[0.98]
            "
          >
            Cari Jasa
          </Link>
        </div>

        <Link
          href="/my-services/new"
          className={`
            mt-3
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-bold
            text-indigo-600
            transition
            active:opacity-70
            ${styles.heroEnterMoreDelayed}
          `}
        >
          Punya waktu atau keahlian? Tawarkan Jasa

          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        </Link>

        <div
          className="
            mt-6
            grid
            grid-cols-3
            divide-x
            divide-slate-100
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            py-3
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              gap-1.5
              px-2
              text-center
            "
          >
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 text-indigo-600"
              strokeWidth={2}
            />

            <span
              className="
                text-[9px]
                font-bold
                leading-3
                text-slate-600
              "
            >
              Profil & verifikasi
            </span>
          </div>

          <div
            className="
              flex
              flex-col
              items-center
              gap-1.5
              px-2
              text-center
            "
          >
            <MessageCircle
              aria-hidden="true"
              className="h-4 w-4 text-indigo-600"
              strokeWidth={2}
            />

            <span
              className="
                text-[9px]
                font-bold
                leading-3
                text-slate-600
              "
            >
              Chat & kesepakatan
            </span>
          </div>

          <div
            className="
              flex
              flex-col
              items-center
              gap-1.5
              px-2
              text-center
            "
          >
            <MapPin
              aria-hidden="true"
              className="h-4 w-4 text-indigo-600"
              strokeWidth={2}
            />

            <span
              className="
                text-[9px]
                font-bold
                leading-3
                text-slate-600
              "
            >
              Berbasis lokasi
            </span>
          </div>
        </div>

        <div className="mt-6">
          <LandingHeroVisual />
        </div>
      </div>
    </section>
  );
}