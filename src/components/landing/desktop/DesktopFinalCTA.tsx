import Link from "next/link";

import {
  ArrowRight,
  HandHeart,
  UserRound,
} from "lucide-react";

export default function DesktopFinalCTA() {
  return (
    <section
      className="
        bg-white
        px-8
        py-20
      "
    >
      <div
        className="
          relative
          mx-auto
          max-w-7xl
          overflow-hidden
          rounded-[40px]
          bg-slate-950
          px-14
          py-14
          text-white
        "
      >
        {/* DECORATION */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-28
            h-96
            w-96
            rounded-full
            bg-indigo-600/30
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            left-1/3
            h-80
            w-80
            rounded-full
            bg-violet-600/20
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-16
          "
        >
          {/* LEFT */}
          <div className="max-w-2xl">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/10
                px-4
                py-2
                text-xs
                font-bold
                text-indigo-100
              "
            >
              <HandHeart
                className="h-4 w-4"
              />

              Mulai dengan HelpMe
            </div>

            <h2
              className="
                mt-5
                text-4xl
                font-black
                leading-tight
                tracking-[-0.035em]
              "
            >
              Ada yang bisa dibantu hari ini?
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                text-slate-300
              "
            >
              Buat task untuk mendapatkan bantuan, atau
              bergabung sebagai helper dan bantu orang lain
              menyelesaikan kebutuhan hariannya.
            </p>
          </div>

          {/* ACTIONS */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
            "
          >
            <Link
              href="/register"
              className="
                inline-flex
                h-13
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                px-7
                text-sm
                font-black
                text-slate-900
                transition
                hover:bg-indigo-50
              "
            >
              Buat Task

              <ArrowRight
                className="h-4 w-4"
              />
            </Link>

            <Link
              href="/register"
              className="
                inline-flex
                h-13
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/15
                bg-white/10
                px-7
                text-sm
                font-bold
                text-white
                transition
                hover:bg-white/15
              "
            >
              <UserRound
                className="h-4 w-4"
              />

              Jadi Helper
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}