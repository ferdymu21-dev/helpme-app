"use client";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  SignOut,
} from "@phosphor-icons/react";

import {
  logout,
} from "@/features/auth/services/auth.service";

const menus = [
  {
    label: "Home",
    href: "/home",
    icon: "🏠",
  },

  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: "📋",
  },

  {
    label: "Messages",
    href: "/messages",
    icon: "💬",
  },

  {
    label: "Helper Tasks",
    href: "/helper-tasks",
    icon: "🛠️",
  },

];

export default function DesktopSidebar() {

  const [hasUnread, setHasUnread] =
    useState(false);

  const [userProfile, setUserProfile] =
    useState<{
      full_name: string;
      avatar_url?: string;
    } | null>(null);

  const pathname =
    usePathname();

  useEffect(() => {

    async function loadUnread() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } =
        await supabase
          .from("users")
          .select(`
      full_name,
      avatar_url
    `)
          .eq("id", user.id)
          .single();

      if (profile) {
        setUserProfile(profile);
      }

      const { data } =
        await supabase
          .from("conversations")
          .select(`
          owner_id,
          helper_id,
          owner_unread_count,
          helper_unread_count
        `);

      if (!data) return;

      const hasUnreadMessage =
        data.some((conversation) => {

          const isOwner =
            conversation.owner_id ===
            user.id;

          return isOwner
            ? conversation.owner_unread_count > 0
            : conversation.helper_unread_count > 0;
        });

      setHasUnread(
        hasUnreadMessage
      );
    }

    loadUnread();

    /* =========================
       REALTIME
    ========================= */

    const channel =
      supabase.channel(
        "sidebar-unread"
      );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        loadUnread();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, []);

  async function handleLogout() {

    const confirmLogout =
      confirm(
        "Keluar dari akun?"
      );

    if (!confirmLogout) return;

    try {

      await logout();

      window.location.href =
        "/login";

    } catch (error) {

      console.error(error);

      alert("Gagal logout");
    }
  }

  return (
    <aside
      className="
        hidden
        lg:flex
        fixed
        left-0
        top-0
        z-40
        h-screen
        w-70
        flex-col
        border-r
        border-slate-200
        bg-white
        px-6
        py-8
      "
    >

      {/* LOGO */}
      <div className="flex justify-center">

        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={140}
          height={140}
          className="h-auto w-45"
          priority
        />

      </div>

      {/* MENU */}
      <nav className="mt-10 flex-1 space-y-2">

        {menus.map((menu) => {
          const active =
            pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex
                items-center
                gap-4
                rounded-2xl
                px-5
                py-4
                text-sm
                font-semibold
                transition

                ${active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >

              <span className="text-lg">
                {menu.icon}
              </span>

              <div className="flex items-center gap-2">

                {menu.label}

                {menu.href === "/messages" &&
                  hasUnread && (

                    <div
                      className="
                        h-2
                        w-2
                        rounded-full
                      bg-red-500
                      "
                    />

                  )}

              </div>

            </Link>
          );
        })}

      </nav>

      <Link
        href="/profile"
        className="
    mt-1
    flex
    items-center
    gap-2
    p-3
    transition
    hover:bg-slate-50
  "
      >

        {userProfile?.avatar_url ? (

          <img
            src={userProfile.avatar_url}
            alt={userProfile.full_name}
            className="
        h-10
        w-10
        rounded-full
        object-cover
      "
          />

        ) : (

          <div
            className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-indigo-100
        font-bold
        text-indigo-700
      "
          >
            {userProfile?.full_name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

        )}

        <div>

          <p
            className="
        text-base
        text-slate-500
      "
          >
            Profile saya
          </p>

        </div>

      </Link>

      <button
        onClick={handleLogout}

        className="
    mt-4
    border-t
  border-slate-100
    pt-4
    flex
    items-center
    gap-3
    rounded-2xl
    px-5
    py-4
    text-sm
    font-semibold
    text-red-500
    transition
    hover:bg-red-50
  "
      >

        <SignOut
          size={20}
          weight="bold"
        />

        Logout

      </button>

    </aside>
  );
}