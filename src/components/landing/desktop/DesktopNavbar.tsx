import Image from "next/image";

import Link from "next/link";

export default function DesktopNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200/80
        bg-white/80
        backdrop-blur-xl
      "
    >

      <div
        className="
          mx-auto
          flex
          h-22
          max-w-7xl
          items-center
          justify-between
          px-8
        "
      >

        {/* LEFT */}
        <Link href="/">

          <Image
            src="/logo_brand.svg"
            alt="HelpMe Logo"
            width={150}
            height={150}
            priority
          />

        </Link>

        {/* CENTER */}
        <nav
          className="
            flex
            items-center
            gap-10
          "
        >

          <Link
            href="/"
            className="
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:text-indigo-600
            "
          >
            Home
          </Link>

          <Link
            href="#cara-kerja"
            className="
              text-sm
              font-semibold
              text-slate-700
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
              text-slate-700
              transition
              hover:text-indigo-600
            "
          >
            Kategori
          </Link>

          <Link
            href="#tentang"
            className="
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:text-indigo-600
            "
          >
            Tentang
          </Link>

        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <Link
            href="/login"
            className="
            flex
              h-12
              items-center
              rounded-2xl
              bg-linear-to-r
              from-amber-500
              to-amber-400
              px-6
              text-sm
              font-bold
              text-black
              shadow-lg
              shadow-amber-500/20
              transition
              hover:text-indigo-600
            "
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="
              flex
              h-12
              items-center
              rounded-2xl
              bg-linear-to-r
              from-indigo-600
              to-violet-600
              px-6
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-indigo-600/20
              transition
              hover:scale-[1.02]
            "
          >
            Mulai Sekarang
          </Link>

        </div>

      </div>

    </header>
  );
}