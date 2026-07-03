"use client";

import { useState } from "react";

import Image from "next/image";

import Link from "next/link";

import {
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function MobileLandingNavbar() {
  const [open, setOpen] = useState(false);

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
          relative
          flex
          items-center
          justify-between
          px-5
          py-2
        "
      >
        {/* LOGO */}
        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={120}
          height={120}
          priority
        />

        {/* MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-xl
    border
    border-slate-200
    bg-white
    text-slate-700
    shadow-sm
    transition
    hover:bg-slate-50
  "
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div
            className="
      absolute
      right-4
      top-14
      w-40
      rounded-2xl
      border
      border-slate-100
      bg-white
      p-2
      shadow-[0_10px_30px_rgba(15,23,42,0.08)]
      animate-in
      fade-in
      zoom-in-95
      duration-150
    "
          >
            <Link
  href="/login"
  onClick={() => setOpen(false)}
  className="
    flex
    items-center
    gap-2
    rounded-xl
    px-3
    py-2
    text-sm
    font-medium
    text-slate-600
    transition
    hover:bg-slate-50
    hover:text-indigo-600
  "
>
  <LogIn size={16} />
  Login
</Link>

<Link
  href="/register"
  onClick={() => setOpen(false)}
  className="
    mt-1
    flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-linear-to-r
    from-indigo-600
    to-blue-600
    px-3
    py-2
    text-sm
    font-semibold
    text-white
    transition
    hover:scale-[1.02]
  "
>
  <UserPlus size={16} />
  Register
</Link>
          </div>
        )}
      </div>
    </header>
  );
}