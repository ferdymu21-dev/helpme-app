"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import DesktopGreetingSection from "@/components/home/desktop/DesktopGreetingSection";
import Link from "next/link";

export default function DesktopHomeHeader() {

  const [name, setName] =
    useState("User");

  const [ 
    hasUnreadNotifications, 
    setHasUnreadNotifications, 
  ] = useState(false);

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

        /* =========================
           GET UNREAD NOTIFICATIONS
        ========================= */

        const { data: notifications } =
          await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_read", false);

        setHasUnreadNotifications(
          (notifications?.length || 0) > 0
        );

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
          <Link
            href="/notifications"
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

            {hasUnreadNotifications && (

            <span
              className="
                absolute
                right-3
                top-3
                h-2
                w-2
                rounded-full
                bg-rose-500
              "
            />
            )}

          </Link>

          {/* PROFILE */}
          <button
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-indigo-100
              text-sm
              font-black
              text-indigo-700
            "
          >
            F
          </button>

        </div>

      </div>

    </header>
  );
}