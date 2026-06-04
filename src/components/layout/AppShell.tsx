"use client";

import BottomNavbar from "./BottomNavbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        mx-auto
        min-h-screen
        max-w-md
        bg-slate-50
        relative
      "
    >
      <div className="pb-24">
        {children}
      </div>

      <BottomNavbar />
    </div>
  );
}