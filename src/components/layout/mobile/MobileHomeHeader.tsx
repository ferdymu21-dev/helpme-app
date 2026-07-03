"use client";

import Image from "next/image";

import Link from "next/link";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

interface Props {

  onOpenSupport: () => void;

}

export default function MobileHomeHeader({

  onOpenSupport,

}: Props) {

  const [initials, setInitials] =
    useState("U");

  const [avatarUrl, setAvatarUrl] =
    useState("");

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

        const { data: profile } =
          await supabase
            .from("users")
            .select(`
      avatar_url
    `)
            .eq("id", user.id)
            .single();

        if (profile?.avatar_url) {

          setAvatarUrl(
            profile.avatar_url
          );

        }

        const fullName =
          user.user_metadata?.full_name;

        if (!fullName) return;

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

        const words =
          fullName.split(" ");

        const first =
          words[0]?.charAt(0) || "";

        const second =
          words[1]?.charAt(0) || "";

        const result =
          `${first}${second}`;

        setInitials(
          result.toUpperCase()
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
        backdrop-blur
      "
    >

      <div
        className="
          mx-auto
          flex
          h-18
          max-w-300
          items-center
          justify-between
          px-6
        "
      >

        {/* LEFT */}
        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={120}
          height={120}
          priority
        />

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <button
            onClick={onOpenSupport}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
            border-slate-200
            bg-white
              text-xl
              transition
            hover:bg-pink-50
            "
            title="Support HelpMe"
          >
            <Image
              src="/icons/support.svg"
              alt="Support HelpMe"
              width={24}
              height={30}
              className="h-7 w-7 object-contain"
            />
          </button>

          {/* NOTIFICATION */}
          <Link
            href="/notifications"
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-lg
              transition
              hover:bg-slate-50
            "
          >
            <Image
              src="/icons/notif.svg"
              alt="Notifications"
              width={24}
              height={24}
              className="h-7 w-7 object-contain"
            />

            {hasUnreadNotifications && (

              <span
                className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
              bg-red-500
              "
              />
            )}

          </Link>

          {/* PROFILE */}

          <Link href="/profile">

            {avatarUrl ? (

              <img
                src={avatarUrl}
                alt="Profile"
                className="
        h-10
        w-10
        rounded-full
        object-cover
        border
        border-slate-200
      "
              />

            ) : (

              <div
                className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-indigo-100
        text-sm
        font-black
        text-indigo-700
      "
              >
                {initials}
              </div>

            )}

          </Link>

        </div>

      </div>

    </header>
  );
}