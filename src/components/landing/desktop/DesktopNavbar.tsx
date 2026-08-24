import Image from "next/image";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

export default function DesktopNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200/70
        bg-white/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-8
        "
      >
        {/* LOGO */}
        <Link
          href="/"
          aria-label="HelpMe"
          className="shrink-0"
        >
          <Image
            src="/logo_brand.svg"
            alt="HelpMe"
            width={132}
            height={48}
            priority
            className="h-auto w-32"
          />
        </Link>

        {/* NAVIGATION */}
        <nav
          className="
            flex
            items-center
            gap-8
          "
        >
          <Link
            href="#cara-kerja"
            className="
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:text-indigo-600
            "
          >
            Cara Kerja
          </Link>

          <Link
            href="#kategori"
            className="
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:text-indigo-600
            "
          >
            Kategori
          </Link>

          <Link
            href="#keamanan"
            className="
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:text-indigo-600
            "
          >
            Keamanan
          </Link>

          <Link
            href="#faq"
            className="
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:text-indigo-600
            "
          >
            FAQ
          </Link>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="
              inline-flex
              h-11
              items-center
              justify-center
              rounded-xl
              px-5
              text-sm
              font-bold
              text-slate-700
              transition
              hover:bg-slate-100
              hover:text-indigo-600
            "
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-indigo-600/20
              transition
              hover:bg-indigo-700
            "
          >
            Mulai Sekarang

            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}