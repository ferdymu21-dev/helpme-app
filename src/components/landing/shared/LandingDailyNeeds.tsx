"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  CarFront,
  Clock3,
  HandHeart,
  House,
  PackageCheck,
  PartyPopper,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface DailyNeed {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}

const dailyNeeds: DailyNeed[] = [
  {
    title: "Jasa Antre",
    description:
      "Bantuan antre untuk kebutuhan harian sesuai kesepakatan.",
    icon: Clock3,
    iconClass:
      "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Antar Jemput",
    description:
      "Bantuan mobilitas untuk aktivitas sehari-hari.",
    icon: CarFront,
    iconClass:
      "bg-blue-50 text-blue-600",
  },
  {
    title: "Titip Ambil",
    description:
      "Ambil paket, barang, dokumen, atau kebutuhan lainnya.",
    icon: PackageCheck,
    iconClass:
      "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Titip Beli",
    description:
      "Minta bantuan membeli kebutuhan sehari-hari.",
    icon: ShoppingBag,
    iconClass:
      "bg-amber-50 text-amber-600",
  },
  {
    title: "Bantuan Rumah",
    description:
      "Temukan bantuan untuk pekerjaan ringan di rumah.",
    icon: House,
    iconClass:
      "bg-rose-50 text-rose-600",
  },
  {
    title: "Pendampingan",
    description:
      "Cari pendamping untuk aktivitas atau keperluan tertentu.",
    icon: HandHeart,
    iconClass:
      "bg-violet-50 text-violet-600",
  },
  {
    title: "Bantuan Acara",
    description:
      "Bantuan ringan untuk persiapan dan kegiatan acara.",
    icon: PartyPopper,
    iconClass:
      "bg-orange-50 text-orange-600",
  },
  {
    title: "Kebutuhan Lainnya",
    description:
      "Ceritakan kebutuhanmu sendiri jika belum ada di daftar.",
    icon: Sparkles,
    iconClass:
      "bg-slate-100 text-slate-600",
  },
];

interface LandingDailyNeedsProps {
  sectionId: string;
}

export default function LandingDailyNeeds({
  sectionId,
}: LandingDailyNeedsProps) {
  const [
    selectedNeedTitle,
    setSelectedNeedTitle,
  ] = useState<string | null>(
    null,
  );

  const selectedNeed =
    dailyNeeds.find(
      (need) =>
        need.title ===
        selectedNeedTitle,
    ) ?? null;
  return (
    <section
      id={sectionId}
      className="
        scroll-mt-20
        border-b
        border-slate-100
        bg-white
        px-5
        py-7
        lg:px-8
        lg:py-20
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-2xl">
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
              Kebutuhan sehari-hari
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
              Bantuan yang dekat dengan
              aktivitasmu
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-6
                text-slate-500
                lg:text-base
                lg:leading-7
              "
            >
              Dari hal sederhana sampai
              kebutuhan yang lebih spesifik,
              cari jasa yang tersedia atau
              buat permintaanmu sendiri.
            </p>
          </div>

          <Link
            href="/services"
            className="
              hidden
              items-center
              gap-2
              text-sm
              font-bold
              text-indigo-600
              transition
              hover:gap-3
              hover:text-indigo-700
              lg:inline-flex
            "
          >
            Jelajahi semua jasa

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>

        {/* MOBILE COMPACT CATEGORIES */}
<div className="mt-8 lg:hidden">
  <div
    className="
      grid
      grid-cols-2
      gap-2.5
    "
  >
    {dailyNeeds.map(
      ({
        title,
        icon: Icon,
        iconClass,
      }) => {
        const isSelected =
          selectedNeedTitle ===
          title;

        return (
          <button
            key={title}
            type="button"
            aria-expanded={
              isSelected
            }
            aria-controls="mobile-daily-need-detail"
            onClick={() =>
              setSelectedNeedTitle(
                isSelected
                  ? null
                  : title,
              )
            }
            className={`
              flex
              min-h-20
              items-center
              gap-3
              rounded-2xl
              border
              p-3
              text-left
              transition
              active:scale-[0.98]

              ${
                isSelected
                  ? `
                    border-indigo-200
                    bg-indigo-50/70
                    shadow-sm
                  `
                  : `
                    border-slate-200
                    bg-white
                  `
              }
            `}
          >
            <span
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${iconClass}
              `}
            >
              <Icon
                aria-hidden="true"
                className="h-4.5 w-4.5"
                strokeWidth={2}
              />
            </span>

            <span
              className="
                min-w-0
                flex-1
                text-[11px]
                font-black
                leading-4
                text-slate-800
              "
            >
              {title}
            </span>

            <ChevronDown
              aria-hidden="true"
              className={`
                h-3.5
                w-3.5
                shrink-0
                text-slate-400
                transition-transform
                duration-200

                ${
                  isSelected
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>
        );
      },
    )}
  </div>

  {selectedNeed && (
    <div
      id="mobile-daily-need-detail"
      className="
        mt-3
        rounded-2xl
        border
        border-indigo-100
        bg-indigo-50/50
        p-4
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <span
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${selectedNeed.iconClass}
          `}
        >
          <selectedNeed.icon
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={2}
          />
        </span>

        <div className="min-w-0">
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-indigo-600
            "
          >
            Detail kebutuhan
          </p>

          <h3
            className="
              mt-1
              text-sm
              font-black
              text-slate-900
            "
          >
            {selectedNeed.title}
          </h3>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-slate-500
            "
          >
            {
              selectedNeed.description
            }
          </p>
        </div>
      </div>
    </div>
  )}
</div>

{/* DESKTOP CATEGORIES */}
<div
  className="
    mt-12
    hidden
    grid-cols-4
    gap-4
    lg:grid
  "
>
  {dailyNeeds.map(
    ({
      title,
      description,
      icon: Icon,
      iconClass,
    }) => (
      <article
        key={title}
        className="
          group
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          transition
          duration-300
          hover:-translate-y-1
          hover:border-indigo-200
          hover:shadow-[0_14px_40px_rgba(15,23,42,0.06)]
        "
      >
        <span
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            transition
            duration-300
            group-hover:scale-105
            ${iconClass}
          `}
        >
          <Icon
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={2}
          />
        </span>

        <h3
          className="
            mt-4
            text-base
            font-black
            text-slate-900
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>
      </article>
    ),
  )}
</div>

        <div
          className="
            mt-8
            flex
            flex-col
            gap-2.5
            sm:flex-row
            lg:mt-10
          "
        >
          <Link
            href="/services"
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
              hover:bg-indigo-700
              active:scale-[0.98]
              lg:hidden
            "
          >
            Jelajahi Jasa

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>

          <Link
            href="/tasks/create"
            className="
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
            Punya kebutuhan lain? Buat task

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}