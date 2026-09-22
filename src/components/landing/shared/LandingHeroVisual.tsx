import {
  CarFront,
  Clock3,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import styles from "./LandingHeroMotion.module.css";

function ActivityCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  className,
}: {
  icon: typeof Clock3;
  eyebrow: string;
  title: string;
  description: string;
  className: string;
}) {
  return (
    <div
      className={`
        absolute
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3.5
        shadow-[0_18px_55px_rgba(15,23,42,0.10)]
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
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
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-slate-400
            "
          >
            {eyebrow}
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-xs
              font-black
              text-slate-900
            "
          >
            {title}
          </p>

          <p
            className="
              mt-1
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingHeroVisual() {
  return (
    <div
      className="
        relative
        mx-auto
        h-77.5
        w-full
        max-w-107.5
        sm:h-85
        lg:h-125
        lg:max-w-none
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-7
          bottom-5
          top-5
          rounded-[36px]
          border
          border-indigo-100/70
          bg-indigo-50/50
          lg:inset-8
          lg:rounded-[44px]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-40
          w-40
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-100/60
          blur-3xl
          lg:h-64
          lg:w-64
        "
      />

      <div
        className={`
          absolute
          left-1/2
          top-1/2
          z-10
          flex
          h-12
          w-12
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-2xl
          border
          border-indigo-100
          bg-white
          shadow-[0_20px_60px_rgba(79,70,229,0.15)]
          lg:h-24
          lg:w-24
          ${styles.floatMedium}
        `}
      >
        <div className="text-center">
          <Sparkles
            aria-hidden="true"
            className="
              mx-auto
              h-3
              w-3
              text-indigo-600
              lg:h-5
              lg:w-5
            "
          />

          <p
            className="
              mt-0.5
              text-[9px]
              font-black
              text-slate-900
              lg:text-sm
            "
          >
            HelpMe
          </p>
        </div>
      </div>

      <ActivityCard
        icon={Clock3}
        eyebrow="Jasa"
        title="Jasa Antre"
        description="Bantu antre kebutuhan harian."
        className={`
          left-0
          top-3
          w-42.5
          sm:left-3
          lg:left-1
          lg:top-16
          lg:w-55
          ${styles.floatSlow}
        `}
      />

      <ActivityCard
        icon={CarFront}
        eyebrow="Jasa"
        title="Antar Jemput"
        description="Bantuan sesuai kesepakatan."
        className={`
          right-0
          top-10
          w-40
          sm:right-2
          lg:right-0
          lg:top-24
          lg:w-56.25
          ${styles.floatDelayed}
        `}
      />

      <ActivityCard
        icon={PackageCheck}
        eyebrow="Permintaan"
        title="Titip Ambil Barang"
        description="Cari bantuan untuk pengambilan ringan."
        className={`
          bottom-18
          -left-2
          w-46.25
          lg:bottom-20
          lg:left-8
          lg:w-57.5
          ${styles.floatDelayed}
        `}
      />

      <ActivityCard
        icon={ShoppingBag}
        eyebrow="Permintaan"
        title="Titip Beli"
        description="bantuan membeli kebutuhanmu."
        className={`
          bottom-10
          -right-1
          w-43.75
          lg:bottom-10
          lg:right-5
          lg:w-55
          ${styles.floatSlow}
        `}
      />

      <div
        className="
          absolute
          left-[60%]
          top-[0%]
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-slate-200
          bg-white
          px-2.5
          py-1.5
          text-[9px]
          font-bold
          text-slate-500
          shadow-sm
          lg:left-[0%]
          lg:top-[18%]
          lg:text-[10px]
        "
      >
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-500
            ${styles.pulseDot}
          `}
        />

        Bantuan di sekitarmu
      </div>

      <div
        className="
          absolute
          bottom-[29%]
          left-[0%]
          top-[85%]
          flex
          items-center
          gap-1
          text-[9px]
          font-bold
          text-indigo-600
          lg:bottom-[27%]
          lg:left-[46%]
          lg:text-[10px]
        "
      >
        <MapPin
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />

        Terhubung lewat HelpMe
      </div>
    </div>
  );
}