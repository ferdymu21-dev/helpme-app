"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          HelpMe
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border px-4 py-2"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}