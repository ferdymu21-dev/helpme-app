"use client";

import Image from "next/image";

import Link from "next/link";

export default function MobileLandingNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-100
        bg-white/90
        backdrop-blur
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-4
        "
      >

        {/* LOGO */}
        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={120}
          height={120}
          className="h-auto w-30"
          priority
          className="h-auto w-[120px]"
        />

        {/* MENU */}
        <button
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            text-xl
            text-slate-700
          "
        >
          ☰
        </button>

      </div>

    </header>
  );
}