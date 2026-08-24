"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import type { HistoryTask } from "@/features/tasks/types/history";

import {
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
} from "@/features/tasks/utils/task-status";

interface Props {
  tasks: HistoryTask[];
  loading: boolean;
  activeTab: "OWNER" | "HELPER";
  setActiveTab: (value: "OWNER" | "HELPER") => void;
  router: {
    push: (href: string) => void;
  };
}

export default function MobileHistoryView({
  tasks,
  loading,
  activeTab,
  setActiveTab,
  router,
}: Props) {
  const [showMobileNavbar, setShowMobileNavbar] = useState(true);

  const lastScrollYRef = useRef(0);

  /* =========================
      MOBILE NAVBAR SCROLL
  ========================= */

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      const previousScrollY = lastScrollYRef.current;

      /*
       * Saat berada dekat bagian atas,
       * navbar selalu ditampilkan.
       */
      if (currentScrollY <= 16) {
        setShowMobileNavbar(true);

        lastScrollYRef.current = currentScrollY;

        return;
      }

      /*
       * Scroll ke bawah
       * -> sembunyikan navbar.
       */
      if (currentScrollY > previousScrollY + 8) {
        setShowMobileNavbar(false);

        lastScrollYRef.current = currentScrollY;

        return;
      }

      /*
       * Scroll ke atas
       * -> tampilkan navbar.
       */
      if (currentScrollY < previousScrollY - 8) {
        setShowMobileNavbar(true);

        lastScrollYRef.current = currentScrollY;
      }
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        p-6
        pb-32
        lg:hidden
      "
    >
      {/* =========================
          HEADER
      ========================= */}
      <div className="relative flex h-10 items-center">
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="Kembali ke profil"
          className="
            relative
            z-10
            inline-flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-50
            active:scale-95
          "
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* TITLE */}
        <h1
          className="
            pointer-events-none
            absolute
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-base
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Riwayat Task
        </h1>
      </div>

      {/* =========================
          TABS
      ========================= */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("OWNER")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            transition

            ${
              activeTab === "OWNER"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          Task Saya
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HELPER")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            transition

            ${
              activeTab === "HELPER"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          Bantuan Saya
        </button>
      </div>

      {/* =========================
          LIST
      ========================= */}
      <div className="mt-6">
        {loading && <p>Memuat...</p>}

        {!loading && tasks.length === 0 && (
          <div
            className="
                rounded-3xl
                border
                border-dashed
                border-slate-200
                bg-white
                p-8
                text-center
              "
          >
            <p className="text-slate-500">Belum ada riwayat</p>
          </div>
        )}

        {!loading &&
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="
        mb-3
        block
        w-full
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-4
        text-left
        shadow-sm
        transition-all
        duration-200
        hover:border-slate-300
        hover:shadow-md
        active:scale-[0.99]
      "
            >
              {/* CATEGORY + URGENT + STATUS */}
              <div
                className="
    flex
    items-center
    justify-between
    gap-3
  "
              >
                {/* CATEGORY */}
                <span
                  className="
      inline-flex
      min-w-0
      max-w-[45%]
      truncate
      rounded-full
      bg-indigo-50
      px-3
      py-1
      text-[10px]
      font-semibold
      text-indigo-600
    "
                >
                  {task.category || "Lainnya"}
                </span>

                {/* URGENT + STATUS */}
                <div
                  className="
      flex
      shrink-0
      items-center
      gap-1.5
    "
                >
                  {task.is_urgent && (
                    <span
                      className="
          rounded-full
          bg-red-100
          px-2
          py-1
          text-[10px]
          font-bold
          text-red-600
        "
                    >
                      🔥 Mendesak
                    </span>
                  )}

                  <span
                    className={`
        rounded-full
        px-3
        py-1
        text-[10px]
        font-semibold
        ${getTaskStatusBadgeClass(task.status)}
      `}
                  >
                    {getTaskStatusLabel(task.status)}
                  </span>
                </div>
              </div>

              {/* =========================
          TITLE
      ========================= */}
              <h2
                className="
          mt-3
          line-clamp-2
          text-base
          font-black
          leading-5
          tracking-tight
          text-slate-900
        "
              >
                {task.title}
              </h2>

              {/* =========================
          CREATED DATE
      ========================= */}
              <div
                className="
          mt-3
          flex
          items-center
          gap-1.5
          text-[11px]
          text-slate-500
        "
              >
                <CalendarDays
                  className="
            h-3.5
            w-3.5
            shrink-0
            text-slate-400
          "
                />

                <span>
                  Dibuat{" "}
                  {new Date(task.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* =========================
          BOTTOM
      ========================= */}
              <div
                className="
          mt-4
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-slate-100
          pt-3
        "
              >
                {/* PRICE */}
                <div className="min-w-0">
                  {task.budget !== null ? (
                    <p
                      className="
                truncate
                text-base
                font-black
                tracking-tight
                text-amber-500
              "
                    >
                      Rp
                      {task.budget.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p
                      className="
                text-xs
                font-medium
                text-slate-400
              "
                    >
                      Budget tidak tersedia
                    </p>
                  )}
                </div>

                {/* DETAIL */}
                <div
                  className="
            flex
            shrink-0
            items-center
            gap-1
            text-xs
            font-semibold
            text-slate-400
          "
                >
                  <span>Detail</span>

                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* =========================
          MOBILE BOTTOM NAVBAR
      ========================= */}
      {showMobileNavbar && <MobileBottomNavbar />}
    </main>
  );
}