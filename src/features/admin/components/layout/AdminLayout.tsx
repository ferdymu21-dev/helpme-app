"use client";

import type { ReactNode } from "react";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div
      className="
    fixed
    inset-0
    flex
    overflow-hidden
    bg-slate-100
  "
    >
      <AdminSidebar />

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-col
        "
      >
        <AdminHeader />

        <main
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}