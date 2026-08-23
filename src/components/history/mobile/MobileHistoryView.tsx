"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { ArrowLeft } from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import type { HistoryTask } from "@/features/tasks/types/history";

interface Props {
  tasks: HistoryTask[];
  loading: boolean;
  activeTab: "OWNER" | "HELPER";
  setActiveTab: (
    value: "OWNER" | "HELPER",
  ) => void;
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
  const [
    showMobileNavbar,
    setShowMobileNavbar,
  ] = useState(true);

  const lastScrollYRef =
    useRef(0);

  /* =========================
      MOBILE NAVBAR SCROLL
  ========================= */

  useEffect(() => {
    lastScrollYRef.current =
      window.scrollY;

    function handleScroll() {
      const currentScrollY =
        window.scrollY;

      const previousScrollY =
        lastScrollYRef.current;

      /*
       * Saat berada dekat bagian atas,
       * navbar selalu ditampilkan.
       */
      if (currentScrollY <= 16) {
        setShowMobileNavbar(true);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      /*
       * Scroll ke bawah
       * -> sembunyikan navbar.
       */
      if (
        currentScrollY >
        previousScrollY + 8
      ) {
        setShowMobileNavbar(false);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      /*
       * Scroll ke atas
       * -> tampilkan navbar.
       */
      if (
        currentScrollY <
        previousScrollY - 8
      ) {
        setShowMobileNavbar(true);

        lastScrollYRef.current =
          currentScrollY;
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
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
          onClick={() =>
            router.push("/profile")
          }
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
          <ArrowLeft
            className="h-5 w-5"
            strokeWidth={2}
          />
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
          onClick={() =>
            setActiveTab("OWNER")
          }
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
          onClick={() =>
            setActiveTab("HELPER")
          }
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
        {loading && (
          <p>Memuat...</p>
        )}

        {!loading &&
          tasks.length === 0 && (
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
              <p className="text-slate-500">
                Belum ada riwayat
              </p>
            </div>
          )}

        {!loading &&
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() =>
                router.push(
                  `/tasks/${task.id}`,
                )
              }
              className="
                mb-4
                w-full
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                text-left
                shadow-sm
                transition
                hover:border-indigo-300
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h2
                    className="
                      text-base
                      font-bold
                      text-slate-900
                    "
                  >
                    {task.title}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {task.category}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="
                      text-lg
                      text-slate-400
                    "
                  >
                    →
                  </span>

                  <div
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-bold

                      ${
                        task.status ===
                        "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : task.status ===
                              "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }
                    `}
                  >
                    {task.status ===
                    "COMPLETED"
                      ? "Selesai"
                      : task.status ===
                          "CANCELLED"
                        ? "Dibatalkan"
                        : "Kadaluarsa"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p
                  className="
                    text-lg
                    font-black
                    text-indigo-600
                  "
                >
                  Rp
                  {task.budget?.toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
            </button>
          ))}
      </div>

      {/* =========================
          MOBILE BOTTOM NAVBAR
      ========================= */}
      {showMobileNavbar && (
        <MobileBottomNavbar />
      )}
    </main>
  );
}