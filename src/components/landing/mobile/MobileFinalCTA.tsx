import Link from "next/link";

import {
  ArrowRight,
  HandHeart,
  UserRound,
} from "lucide-react";

export default function MobileFinalCTA() {
  return (
    <section
      className="
        bg-white
        px-5
        py-12
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-slate-950
          p-6
          text-white
        "
      >
        {/* DECORATION */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-52
            w-52
            rounded-full
            bg-indigo-600/30
            blur-3xl
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
              bg-white/10
              text-indigo-200
            "
          >
            <HandHeart
              className="h-5 w-5"
            />
          </div>

          <h2
            className="
              mt-5
              text-2xl
              font-black
              leading-tight
              tracking-[-0.03em]
            "
          >
            Ada yang bisa dibantu hari ini?
          </h2>

          <p
            className="
              mt-3
              text-xs
              leading-6
              text-slate-300
            "
          >
            Buat task atau bergabung menjadi helper dan
            mulai gunakan HelpMe untuk kebutuhan harian.
          </p>

          <div className="mt-6 grid gap-2.5">
            <Link
              href="/register"
              className="
                flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                px-5
                text-sm
                font-black
                text-slate-900
                transition
                active:scale-[0.99]
              "
            >
              Buat Task Sekarang

              <ArrowRight
                className="h-4 w-4"
              />
            </Link>

            <Link
              href="/register"
              className="
                flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/15
                bg-white/10
                px-5
                text-sm
                font-bold
                text-white
                transition
                active:scale-[0.99]
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