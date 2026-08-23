"use client";


import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  useNotificationBadge,
} from "@/features/notifications/hooks/useNotificationBadge";

import NotificationDropdown
  from "@/features/notifications/components/NotificationDropdown";

import {
  useNotificationDropdown,
} from "@/features/notifications/hooks/useNotificationDropdown";

import DesktopGreetingSection
  from "@/components/home/desktop/DesktopGreetingSection";

export default function DesktopHomeHeader() {

  const [name, setName] =
    useState("User");

  const {
    hasUnread,
    unreadCount,
  } = useNotificationBadge();

  const {
    open,
    toggle,
    ref: containerRef,
  } = useNotificationDropdown();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const fullName =
          user.user_metadata?.full_name;

        if (fullName) {
          setName(fullName);
        }

      } catch (error) {
        console.error(error);
      }
    }

    loadUser();
  }, []);

  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-slate-200
        bg-white/80
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          h-20
          items-center
          justify-between
          px-10
        "
      >
        {/* LEFT */}
        <div>
          <DesktopGreetingSection />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div
            className="
              flex
              h-12
              w-80
              items-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
            "
          >

            <span className="text-slate-400">
              🔍

            </span>

            <input
              type="text"
              placeholder="Cari task..."
              className="
                ml-3
                w-full
                bg-transparent
                text-sm
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

              onClick={toggle}

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
      text-xl
      transition
      hover:bg-slate-50
    "

            >

              🔔

              {hasUnread && (

                <span
                  className="
          absolute
          -right-1
          -top-1
          flex
          min-h-5
          min-w-5
          items-center
          justify-center
          rounded-full
          bg-rose-500
          px-1
          text-[10px]
          font-bold
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