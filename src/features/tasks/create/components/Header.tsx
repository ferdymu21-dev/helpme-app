"use client";

import { ArrowLeft } from "lucide-react";

type HeaderProps = {
  onBack: () => void;
};

export default function Header({
  onBack,
}: HeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        items-center
        border-b
        border-slate-200/80
        bg-white/90
        px-4
        py-3
        backdrop-blur-xl
        sm:static
        sm:border-b-0
        sm:bg-transparent
        sm:px-6
        sm:pt-8
        sm:backdrop-blur-none
      "
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-slate-200
          bg-white
          text-slate-700
          shadow-sm
          transition
          hover:bg-slate-50
        "
      >
        <ArrowLeft
          size={19}
          strokeWidth={2.2}
        />
      </button>

      <div className="min-w-0 flex-1 px-3 text-center">
        <h1 className="text-[15px] font-bold text-slate-900">
          Cari Bantuan
        </h1>

        <p className="mt-0.5 text-[11px] text-slate-500">
          Buat kebutuhan baru
        </p>
      </div>

      <div className="h-10 w-10" />
    </header>
  );
}