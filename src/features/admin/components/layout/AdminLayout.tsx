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
                flex
                min-h-screen
                bg-slate-100
            "
    >
      <AdminSidebar />

      <div
        className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                "
      >
        <AdminHeader />

        <main
          className="
                        flex-1
                        overflow-auto
                        p-8
                    "
        >
          {children}
        </main>
      </div>
    </div>
  );
}