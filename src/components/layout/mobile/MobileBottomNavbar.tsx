"use client";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

const menus = [
  {
    href: "/home",
    label: "Home",
    icon: (
      <Image
        src="/icons/home-icon.svg"
        alt="Home"
        width={25}
        height={25}
      />
    ),
  },

  {
  href: "/my-tasks",
  label: "Task",
  icon: (
    <Image
      src="/icons/tasks-icon.svg"
      alt="Task"
      width={25}
      height={25}
    />
  ),
},

  {
  href: "/tasks/create",
  label: "Create",
  icon: (
    <Image
      src="/icons/create-icon.svg"
      alt="Create"
      width={28}
      height={28}
    />
  ),
  primary: true,
},

  {
  href: "/helper-tasks",
  label: "Helper",
  icon: (
    <Image
      src="/icons/helper-icon.svg"
      alt="Helper"
      width={25}
      height={25}
    />
  ),
},

 {
  href: "/messages",
  label: "Chat",
  icon: (
    <Image
      src="/icons/messages-icon.svg"
      alt="Chat"
      width={25}
      height={25}
    />
  ),
},

];

export default function MobileBottomNavbar() {

  const [hasUnread, setHasUnread] =
    useState(false);

  const pathname = usePathname();

  useEffect(() => {

    async function loadUnread() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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
        "mobile-navbar-unread"
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

  return (
    <div
      className="
        fixed
        bottom-0
        left-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-md
        -translate-x-1/2
        rounded-2xl
        border
        border-slate-200
        bg-white/90
        p-0
        shadow-[0_20px_50px_rgba(15,23,42,0.12)]
        backdrop-blur
        md:hidden
      "
    >

      <div className="grid grid-cols-5 gap-2">

        {menus.map((menu) => {
          const active =
            pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                py-2
                transition

                ${menu.primary
                  ? "bg-slate-100 text-indigo-600 shadow-lg shadow-indigo-600/20"
                  : active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }
              `}
            >

              <div className="relative">

                <span className="text-base">
                  {menu.icon}
                </span>

                {menu.href === "/messages" &&
                  hasUnread && (

                    <div
                      className="
                        absolute
                        -right-1
                        -top-1
                        h-2
                        w-2
                        rounded-full
                      bg-red-500
                      "
                    />

                  )}

              </div>

              <span
                className="
                  mt-1
                  text-[10px]
                  font-semibold
                "
              >
                {menu.label}
              </span>

            </Link>
          );
        })}

      </div>

    </div>
  );
}