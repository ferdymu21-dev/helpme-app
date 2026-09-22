"use client";

import { useState } from "react";

import {
  CheckCircle2,
  MessageCircle,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";

interface HowItWorksStep {
  number: string;
  icon: LucideIcon;
  compactTitle: string;
  title: string;
  description: string;
  note: string;
}

const steps: HowItWorksStep[] = [
  {
    number: "01",
    icon: SearchCheck,
    compactTitle: "Pilih",
    title: "Pilih cara yang sesuai",
    description:
      "Buat permintaan bantuan untuk kebutuhan yang spesifik, atau cari jasa yang sudah tersedia.",
    note:
      "Permintaan Bantuan • Cari Jasa",
  },
  {
    number: "02",
    icon: MessageCircle,
    compactTitle: "Diskusikan",
    title: "Diskusikan & sepakati",
    description:
      "Gunakan chat untuk membahas kebutuhan, waktu, lokasi, harga, dan detail pekerjaan sebelum dimulai.",
    note:
      "Chat • Detail • Kesepakatan",
  },
  {
    number: "03",
    icon: CheckCircle2,
    compactTitle: "Selesaikan",
    title: "Selesaikan dengan jelas",
    description:
      "Pekerjaan dilakukan sesuai kesepakatan. Pembayaran dilakukan langsung sesuai metode dan waktu yang disepakati bersama.",
    note:
      "Pekerjaan • Pembayaran • Selesai",
  },
];

interface LandingHowItWorksProps {
  sectionId: string;
}

export default function LandingHowItWorks({
  sectionId,
}: LandingHowItWorksProps) {
  const [
    activeStepIndex,
    setActiveStepIndex,
  ] = useState(0);

  const activeStep =
    steps[activeStepIndex];

  const ActiveStepIcon =
    activeStep.icon;
  return (
    <section
      id={sectionId}
      className="
        scroll-mt-20
        bg-white
        px-4
        py-12
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
          {/* BACKGROUND DETAIL */}
          <div
            aria-hidden="true"
            className="
              absolute
              right-0
              top-0
              h-40
              w-40
              translate-x-1/3
              -translate-y-1/3
              rounded-full
              border
              border-white/10
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              right-10
              top-6
              h-24
              w-24
              rounded-full
              border
              border-white/5
            "
          />

          <div
            className="
              relative
              grid
              gap-9
              lg:grid-cols-[0.8fr_1.2fr]
              lg:gap-14
            "
          >
            {/* LEFT INTRO */}
            <div
              className="
                flex
                flex-col
                lg:justify-between
              "
            >
              <div>
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/6
                    px-3
                    py-1.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-indigo-400
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-indigo-300
                    "
                  >
                    Cara kerja
                  </span>
                </div>

                <h2
                  className="
                    mt-5
                    max-w-md
                    text-2xl
                    font-black
                    leading-[1.12]
                    tracking-[-0.04em]
                    text-white
                    sm:text-3xl
                    lg:text-[42px]
                  "
                >
                  Dari kebutuhan sampai
                  selesai, tetap sederhana
                </h2>

                <p
                  className="
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-400
                    lg:text-base
                    lg:leading-7
                  "
                >
                  HelpMe membantu kamu
                  menemukan, berkomunikasi,
                  dan menyepakati bantuan yang
                  sesuai kebutuhan.
                </p>
              </div>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  gap-2
                  lg:mt-10
                "
              >
                <span
                  className="
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-300
                  "
                >
                  Permintaan Bantuan
                </span>

                <span
                  className="
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-300
                  "
                >
                  Cari Jasa
                </span>

                <span
                  className="
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-300
                  "
                >
                  Kesepakatan
                </span>
              </div>
            </div>

            {/* PROCESS */}
<div className="relative">
  {/* COMPACT STEP SELECTOR */}
  <div
    className="
      grid
      grid-cols-3
      gap-2
      sm:gap-3
    "
  >
    {steps.map(
      (
        {
          number,
          icon: Icon,
          compactTitle,
        },
        index,
      ) => {
        const isActive =
          activeStepIndex === index;

        return (
          <button
            key={number}
            type="button"
            aria-pressed={isActive}
            onClick={() =>
              setActiveStepIndex(index)
            }
            className={`
              group
              relative
              flex
              min-h-24
              flex-col
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              px-2
              py-3
              text-center
              transition
              duration-300
              active:scale-[0.97]
              sm:min-h-28
              sm:px-3
              lg:rounded-3xl

              ${
                isActive
                  ? `
                    border-white
                    bg-white
                    shadow-[0_16px_38px_rgba(0,0,0,0.20)]
                  `
                  : `
                    border-white/10
                    bg-white/5
                    hover:border-white/20
                    hover:bg-white/8
                  `
              }
            `}
          >
            {/* ACTIVE TOP LINE */}
            <span
              aria-hidden="true"
              className={`
                absolute
                left-1/2
                top-0
                h-0.75
                -translate-x-1/2
                rounded-b-full
                bg-indigo-500
                transition-all
                duration-300

                ${
                  isActive
                    ? "w-10 opacity-100"
                    : "w-0 opacity-0"
                }
              `}
            />

            <span
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                transition
                duration-300
                sm:h-10
                sm:w-10

                ${
                  isActive
                    ? `
                      bg-indigo-50
                      text-indigo-600
                    `
                    : `
                      bg-white/8
                      text-indigo-300
                    `
                }
              `}
            >
              <Icon
                aria-hidden="true"
                className="
                  h-4
                  w-4
                  sm:h-4.5
                  sm:w-4.5
                "
                strokeWidth={2.1}
              />
            </span>

            <span
              className={`
                mt-2
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                sm:text-[9px]

                ${
                  isActive
                    ? "text-indigo-600"
                    : "text-indigo-300"
                }
              `}
            >
              Langkah {number}
            </span>

            <span
              className={`
                mt-1
                text-[10px]
                font-black
                leading-4
                sm:text-xs

                ${
                  isActive
                    ? "text-slate-950"
                    : "text-white"
                }
              `}
            >
              {compactTitle}
            </span>
          </button>
        );
      },
    )}
  </div>

  {/* ACTIVE STEP DETAIL */}
  <div
    className="
      relative
      mt-3
      overflow-hidden
      rounded-2xl
      border
      border-white/10
      bg-white/5.5
      p-4
      sm:p-5
      lg:mt-4
      lg:rounded-3xl
      lg:p-6
    "
  >
    {/* DECORATIVE NUMBER */}
    <span
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        -right-1
        -top-2
        text-[72px]
        font-black
        leading-none
        tracking-[-0.08em]
        text-white/[0.035]
        sm:text-[90px]
      "
    >
      {activeStep.number}
    </span>

    <div
      className="
        relative
        flex
        items-start
        gap-3.5
        sm:gap-4
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
          bg-indigo-500
          text-white
          shadow-lg
          shadow-indigo-950/30
          sm:h-12
          sm:w-12
        "
      >
        <ActiveStepIcon
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-indigo-300
          "
        >
          Langkah {activeStep.number}
        </p>

        <h3
          className="
            mt-1
            text-base
            font-black
            tracking-[-0.02em]
            text-white
            sm:text-lg
            lg:text-xl
          "
        >
          {activeStep.title}
        </h3>

        <p
          className="
            mt-2
            max-w-xl
            text-[11px]
            leading-5
            text-slate-400
            sm:text-xs
            lg:text-sm
            lg:leading-6
          "
        >
          {activeStep.description}
        </p>

        <div
          className="
            mt-4
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              h-px
              w-5
              bg-indigo-400
            "
          />

          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.09em]
              text-slate-500
              sm:text-[9px]
            "
          >
            {activeStep.note}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* AGREEMENT NOTE */}
  <div
    className="
      mt-3
      rounded-2xl
      border
      border-indigo-400/20
      bg-indigo-400/8
      px-4
      py-3.5
      lg:mt-4
      lg:px-5
      lg:py-4
    "
  >
    <div
      className="
        flex
        gap-3
      "
    >
      <CheckCircle2
        aria-hidden="true"
        className="
          mt-0.5
          h-4
          w-4
          shrink-0
          text-indigo-300
        "
        strokeWidth={2}
      />

      <p
        className="
          text-[11px]
          leading-5
          text-slate-300
          lg:text-xs
        "
      >
        Detail harga, waktu, metode
        pembayaran, dan pekerjaan
        ditentukan berdasarkan kesepakatan
        antara pengguna dan pihak yang
        membantu.
      </p>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </section>
  );
}