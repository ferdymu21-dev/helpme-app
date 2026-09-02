"use client";

import {
  Bell,
  Search,
} from "lucide-react";

import {
  useNotificationBadge,
} from "@/features/notifications/hooks/useNotificationBadge";

import NotificationDropdown from "@/features/notifications/components/NotificationDropdown";

import {
  useNotificationDropdown,
} from "@/features/notifications/hooks/useNotificationDropdown";

import DesktopGreetingSection from "@/components/home/desktop/DesktopGreetingSection";

import DesktopPendingPaymentCard from "@/components/home/desktop/DesktopPendingPaymentCard";

import type {
  PendingPaymentSummary,
} from "@/features/payments/types/pendingPayment";

interface Props {
  pendingPayment:
    PendingPaymentSummary | null;

  pendingPaymentLoading: boolean;

  resumePaymentLoading: boolean;

  onResumePayment: () => void;
}

export default function DesktopHomeHeader({
  pendingPayment,
  pendingPaymentLoading,
  resumePaymentLoading,
  onResumePayment,
}: Props) {
  const {
    hasUnread,
    unreadCount,
  } = useNotificationBadge();

  const {
    open,
    toggle,
    ref: containerRef,
  } = useNotificationDropdown();

  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-slate-200/80
        bg-white/85
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-22
          max-w-360
          items-center
          justify-between
          gap-8
          px-8
          xl:px-10
        "
      >
        {/* LEFT */}
        <div
          className="
            min-w-0
            flex-1
          "
        >
          {pendingPaymentLoading ? (
            <div
              className="
                h-14
                w-full
                max-w-md
                animate-pulse
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
              "
            />
          ) : pendingPayment ? (
            <DesktopPendingPaymentCard
              payment={pendingPayment}
              loading={
                resumePaymentLoading
              }
              onResume={
                onResumePayment
              }
            />
          ) : (
            <DesktopGreetingSection />
          )}
        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          {/*
           * Search existing belum terhubung
           * ke query/filter task.
           * Kita pertahankan tampilannya
           * tanpa mengubah behavior.
           */}
          <div
            className="
              hidden
              h-12
              w-72
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              transition
              focus-within:border-indigo-300
              focus-within:bg-white
              focus-within:ring-4
              focus-within:ring-indigo-50
              xl:flex
            "
          >
            <Search
              className="
                h-4
                w-4
                shrink-0
                text-slate-400
              "
              strokeWidth={2}
            />

            <input
              type="text"
              placeholder="Cari task..."
              aria-label="Cari task"
              className="
                w-full
                bg-transparent
                text-sm
                text-slate-800
                outline-none
                placeholder:text-slate-400
              "
            />
          </div>

          {/* NOTIFICATION */}
          <div
            ref={containerRef}
            className="relative"
          >
            <button
              type="button"
              onClick={toggle}
              aria-label="Notifikasi"
              title="Notifikasi"
              className="
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-indigo-600
                active:scale-95
              "
            >
              <Bell
                className="h-5 w-5"
                strokeWidth={2}
              />

              {hasUnread && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    flex
                    min-h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-red-500
                    px-1
                    text-[9px]
                    font-black
                    leading-none
                    text-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <NotificationDropdown />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}