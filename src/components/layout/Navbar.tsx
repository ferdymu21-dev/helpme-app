"use client";

import Link from "next/link";

import BrandLogo from "@/components/branding/BrandLogo";

export default function Navbar() {
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
          mx-auto
          flex
          h-20
          max-w-6xl
          items-center
          justify-between
          px-6
        "
      >
        {/* LOGO */}
        <BrandLogo />

        {/* MENU */}
        <nav className="hidden items-center gap-8 md:flex">

          <a
            href="#"
            className="
              text-sm
              font-medium
              text-primary-600
            "
          >
            Beranda
          </a>

          <a
            href="#"
            className="
              text-sm
              text-slate-600
            "
          >
            Cara Kerja
          </a>

          <a
            href="#"
            className="
              text-sm
              text-slate-600
            "
          >
            Kategori
          </a>

          <a
            href="#"
            className="
              text-sm
              text-slate-600
            "
          >
            Tentang
          </a>

        </nav>

        {/* ACTION */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="
              hidden
              rounded-2xl
              border
              border-slate-200
              px-5
              py-3
              text-sm
              font-medium
              text-slate-700
              md:block
            "
          >
            Login
          </Link>

          <Link
            href="/register"
            className="
              rounded-2xl
              bg-primary-600
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:opacity-90
            "
          >
            Buat Task
          </Link>

        </div>
      </div>
    </header>
  );
}