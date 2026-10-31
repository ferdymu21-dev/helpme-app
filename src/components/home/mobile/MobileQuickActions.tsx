import Link from "next/link";

import { ArrowUpRight, BriefcaseBusiness, Plus } from "lucide-react";

import HelpMeSiagaHomeCard from "@/components/home/HelpMeSiagaHomeCard";

export default function MobileQuickActions() {
  return (
    <section className="px-5 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black tracking-wide text-slate-500 uppercase">
          Akses Cepat
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* CREATE (BUTUH BANTUAN) */}
        <Link
          href="/tasks/create"
          className="
            group
            relative
            flex
            min-h-20
            items-center
            gap-3
            overflow-hidden
            rounded-[22px]
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            px-4
            py-3
            text-white
            shadow-[0_10px_24px_rgba(79,70,229,0.18)]
            transition
            hover:from-indigo-500
            hover:to-violet-500
            active:scale-[0.98]
          "
        >
          {/* Efek bulatan background disesuaikan posisinya */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-white/10" />

          <div className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Plus className="h-4 w-4" strokeWidth={2.4} />
          </div>

          <div className="min-w-0 flex-1 relative z-10">
            <h3 className="text-[12px] font-bold text-white leading-tight">
              Butuh Bantuan?
            </h3>
            <p className="mt-0.5 text-[9px] leading-3 text-indigo-100/90 line-clamp-2">
              Buat task dan temukan helper
            </p>
          </div>

          <ArrowUpRight
            className="absolute top-3 right-3 h-3.5 w-3.5 text-indigo-100 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </Link>

        {/* OFFER SERVICE (TAWARKAN JASA) */}
        <Link
          href="/my-services/new"
          className="
            group
            relative
            flex
            min-h-20
            items-center
            gap-3
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-[0_8px_22px_rgba(15,23,42,0.04)]
            transition
            hover:bg-slate-50
            hover:border-slate-300
            active:scale-[0.98]
          "
        >
          {/* Efek bulatan background disesuaikan posisinya */}
          <div className="pointer-events-none absolute -bottom-12 -right-10 h-24 w-24 rounded-full bg-amber-50/60" />

          <div className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1 relative z-10">
            <h3 className="text-[12px] font-bold text-slate-900 leading-tight">
              Tawarkan Jasa
            </h3>
            <p className="mt-0.5 text-[9px] leading-3 text-slate-500 line-clamp-2">
              Tawarkan keahlian Anda
            </p>
          </div>

          <ArrowUpRight
            className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </Link>
      </div>
      <HelpMeSiagaHomeCard className="mt-2.5" />
    </section>
  );
}