"use client";

import {
  useState,
} from "react";

import Image from "next/image";

import Link from "next/link";

import {
  CircleHelp,
  Grid2X2,
  LogIn,
  Menu,
  ShieldCheck,
  UserPlus,
  Workflow,
  X,
} from "lucide-react";

const navigationItems = [
  {
    href: "#cara-kerja-mobile",
    label: "Cara Kerja",
    icon: Workflow,
  },
  {
    href: "#kategori-mobile",
    label: "Kategori",
    icon: Grid2X2,
  },
  {
    href: "#keamanan-mobile",
    label: "Keamanan",
    icon: ShieldCheck,
  },
  {
    href: "#faq-mobile",
    label: "FAQ",
    icon: CircleHelp,
  },
];

export default function MobileLandingNavbar() {
  const [open, setOpen] =
    useState(false);

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-100
        bg-white/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          h-16
          max-w-xl
          items-center
          justify-between
          px-5
        "
      >
        {/* LOGO */}
        <Link
          href="/"
          aria-label="HelpMe"
        >
          <Image
            src="/logo_brand.svg"
            alt="HelpMe"
            width={112}
            height={40}
            priority
            className="h-auto w-27"
          />
        </Link>

        {/* MENU BUTTON */}
        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) =>
                !current,
            )
          }
          aria-label={
            open
              ? "Tutup menu"
              : "Buka menu"
          }
          aria-expanded={open}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            transition
            active:scale-95
          "
        >
          {open ? (
            <X
              className="h-5 w-5"
              strokeWidth={2}
            />
          ) : (
            <Menu
              className="h-5 w-5"
              strokeWidth={2}
            />
          )}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div
            className="
              absolute
              left-5
              right-5
              top-14
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-2
              shadow-[0_20px_50px_rgba(15,23,42,0.14)]
            "
          >
            {/* NAV LINKS */}
            <nav>
              {navigationItems.map(
                ({
                  href,
                  label,
                  icon: Icon,
                }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() =>
                      setOpen(false)
                    }
                    className="
                      flex
                      min-h-11
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-sm
                      font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-indigo-600
                    "
                  >
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={2}
                    />

                    {label}
                  </Link>
                ),
              )}
            </nav>

            {/* DIVIDER */}
            <div
              className="
                my-2
                h-px
                bg-slate-100
              "
            />

            {/* LOGIN */}
            <Link
              href="/login"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                min-h-11
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              <LogIn
                className="h-4 w-4"
              />

              Masuk
            </Link>

            {/* REGISTER */}
            <Link
              href="/register"
              onClick={() =>
                setOpen(false)
              }
              className="
                mt-1
                flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              <UserPlus
                className="h-4 w-4"
              />

              Mulai Sekarang
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}