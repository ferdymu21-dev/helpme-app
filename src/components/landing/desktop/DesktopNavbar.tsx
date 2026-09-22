import Image from "next/image";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

const navigationItems = [
  {
    label: "Cara Kerja",
    href: "#cara-kerja",
  },
  {
    label: "Cari Jasa",
    href: "/services",
  },
  {
    label: "Pembayaran",
    href: "#pembayaran",
  },
  {
    label: "Keamanan",
    href: "#keamanan",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

export default function DesktopNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200/70
        bg-white/95
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-17
          max-w-7xl
          items-center
          justify-between
          gap-8
          px-8
          xl:px-10
        "
      >
        <Link
          href="/"
          aria-label="HelpMe"
          className="
            shrink-0
            transition
            hover:opacity-90
          "
        >
          <Image
            src="/logo_brand.svg"
            alt="HelpMe"
            width={132}
            height={48}
            priority
            className="
              h-auto
              w-30
            "
          />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-1
          "
        >
          {navigationItems.map(
            ({
              label,
              href,
            }) => (
              <Link
                key={label}
                href={href}
                className="
                  rounded-lg
                  px-3.5
                  py-2
                  text-[13px]
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-indigo-600
                  active:scale-[0.98]
                "
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <Link
            href="/login"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              px-4
              text-sm
              font-bold
              text-slate-700
              transition
              hover:bg-slate-50
              hover:text-indigo-600
              active:scale-[0.98]
            "
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-4
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:bg-indigo-700
              active:translate-y-0
            "
          >
            Mulai Sekarang

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={2.2}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}