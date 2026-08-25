import type { ReactNode } from "react";

import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import BrandLogo from "@/components/branding/BrandLogo";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

const benefits = [
  {
    icon: UsersRound,
    title: "Temukan bantuan lebih mudah",
    description:
      "Hubungkan kebutuhan sehari-hari dengan orang yang siap membantu.",
  },
  {
    icon: ShieldCheck,
    title: "Lebih aman dan terpercaya",
    description:
      "Profil, aktivitas, dan interaksi dirancang untuk pengalaman yang lebih aman.",
  },
  {
    icon: CheckCircle2,
    title: "Sederhana dari awal sampai selesai",
    description:
      "Buat kebutuhan, temukan bantuan, dan selesaikan semuanya dalam satu tempat.",
  },
];

export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-50
      "
    >
      {/* BACKGROUND DECORATION */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-32
            -top-32
            h-80
            w-80
            rounded-full
            bg-primary-100
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-24
            h-96
            w-96
            rounded-full
            bg-amber-100/60
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-7xl
          items-center
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-12
        "
      >
        <div
          className="
            grid
            w-full
            overflow-hidden
            rounded-4xl
            border
            border-slate-200/80
            bg-white
            shadow-[0_30px_80px_-35px_rgba(15,23,42,0.28)]
            lg:min-h-170
            lg:grid-cols-[1.05fr_0.95fr]
          "
        >
          {/* BRAND PANEL */}
          <section
            className="
              relative
              hidden
              overflow-hidden
              bg-linear-to-br
              from-primary-600
              via-indigo-600
              to-violet-600
              p-12
              text-white
              lg:flex
              lg:flex-col
              lg:justify-between
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-24
                -top-24
                h-72
                w-72
                rounded-full
                border
                border-white/10
                bg-white/5
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-24
                -left-20
                h-72
                w-72
                rounded-full
                border
                border-white/10
                bg-white/5
              "
            />

            <div className="relative">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/15
                  bg-white/10
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-indigo-50
                  backdrop-blur
                "
              >
                <Sparkles
                  className="h-4 w-4 text-amber-300"
                  aria-hidden="true"
                />

                Marketplace bantuan sehari-hari
              </div>

              <div className="mt-10 max-w-lg">
                <h1
                  className="
                    text-4xl
                    font-black
                    tracking-tight
                    text-white
                    xl:text-5xl
                    xl:leading-[1.1]
                  "
                >
                  Bantuan kecil bisa berarti besar.
                </h1>

                <p
                  className="
                    mt-6
                    max-w-md
                    text-base
                    leading-7
                    text-indigo-100
                  "
                >
                  HelpMe mempertemukan orang yang membutuhkan bantuan
                  dengan orang yang siap membantu di sekitar mereka.
                </p>
              </div>

              <div className="mt-10 space-y-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div
                      key={benefit.title}
                      className="flex max-w-lg gap-4"
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
                          border
                          border-white/15
                          bg-white/10
                        "
                      >
                        <Icon
                          className="h-5 w-5 text-amber-300"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-white">
                          {benefit.title}
                        </h2>

                        <p
                          className="
                            mt-1
                            text-sm
                            leading-6
                            text-indigo-100
                          "
                        >
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="
                relative
                mt-12
                border-t
                border-white/10
                pt-6
                text-sm
                text-indigo-100
              "
            >
              Cari bantuan. Jadi Helper. Selesaikan lebih banyak.
            </div>
          </section>

          {/* AUTH PANEL */}
          <section
            className="
              flex
              items-center
              justify-center
              px-5
              py-8
              sm:px-10
              sm:py-12
              lg:px-14
              xl:px-20
            "
          >
            <div className="w-full max-w-md">
              <div className="flex justify-center lg:justify-start">
                <BrandLogo size={150} />
              </div>

              <div className="mt-4">
                <h2
                  className="
                    text-center
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-950
                    sm:text-3xl
                    lg:text-left
                  "
                >
                  {title}
                </h2>

                <p
                  className="
                    mt-3
                    text-center
                    text-sm
                    leading-6
                    text-slate-500
                    sm:text-base
                    lg:text-left
                  "
                >
                  {description}
                </p>
              </div>

              <div className="mt-8">{children}</div>

              <p
                className="
                  mt-10
                  text-center
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Dengan melanjutkan, Anda menggunakan HelpMe sesuai
                kebijakan dan ketentuan yang berlaku.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}