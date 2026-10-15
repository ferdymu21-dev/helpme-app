import Link from "next/link";

import { ArrowUpRight, BriefcaseBusiness, PhoneCall, Plus } from "lucide-react";

export default function MobileQuickActions() {
  return (
    <section
      className="
        px-5
        pt-5
      "
    >
      <div
        className="
          mb-3
          flex
          items-center
          justify-between
        "
      >
        <p
          className="
            text-[10px]
            font-black
            tracking-wide
            text-slate-500
            uppercase
          "
        >
          Akses Cepat
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        {/* CREATE */}
        <Link
          href="/tasks/create"
          className="
            group
            relative
            min-h-32
            overflow-hidden
            rounded-[22px]
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            p-4
            text-white
            shadow-[0_10px_24px_rgba(79,70,229,0.18)]
            transition
            active:scale-[0.98]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -top-10
              -right-10
              h-28
              w-28
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              relative
              flex
              h-full
              flex-col
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/15
                "
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
              </div>

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  text-indigo-100
                "
                strokeWidth={2}
              />
            </div>

            <div className="mt-auto pt-5">
              <h3
                className="
                  text-sm
                  font-black
                "
              >
                Butuh Bantuan?
              </h3>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-4
                  text-indigo-100
                "
              >
                Buat task dan temukan helper.
              </p>
            </div>
          </div>
        </Link>

        {/* OFFER SERVICE */}
        <Link
          href="/my-services/new"
          className="
            group
            relative
            min-h-32
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-white
            p-4
            shadow-[0_8px_22px_rgba(15,23,42,0.04)]
            transition
            active:scale-[0.98]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -bottom-12
              h-28
              w-28
              rounded-full
              bg-amber-50
            "
          />

          <div
            className="
              relative
              flex
              h-full
              flex-col
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-50
                  text-amber-600
                "
              >
                <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />
              </div>

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  text-slate-300
                "
                strokeWidth={2}
              />
            </div>

            <div className="mt-auto pt-5">
              <h3
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Tawarkan Jasa
              </h3>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-4
                  text-slate-500
                "
              >
                Tawarkan keahlian Anda dan dapatkan penghasilan.
              </p>
            </div>
          </div>
        </Link>
      </div>
          <Link
        href="/siaga"
        className="
          group
          mt-4
          flex
          min-h-20
          items-center
          gap-3
          rounded-[22px]
          border
          border-rose-200
          bg-rose-50
          px-4
          py-4
          text-left
          transition
          hover:border-rose-300
          hover:bg-rose-100
          active:scale-[0.99]
        "
      >
        <span
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-rose-600
            text-white
          "
        >
          <PhoneCall className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-rose-950">
            HelpMe Siaga
          </span>
          <span className="mt-1 block text-xs leading-5 text-rose-800">
            Akses cepat ke layanan darurat resmi.
          </span>
        </span>
        <ArrowUpRight
          className="h-5 w-5 shrink-0 text-rose-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </Link>
</section>
  );
}
