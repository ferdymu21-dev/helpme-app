"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

const menus = [
  {
    label: "Beranda",
    description: "Temukan bantuan di sekitar",
    href: "/home",
    icon: "/icons/home-icon.svg",
  },
  {
    label: "Task Saya",
    description: "Kelola task yang Anda buat",
    href: "/my-tasks",
    icon: "/icons/tasks-icon.svg",
  },
  {
    label: "Buat Task",
    description: "Cari helper untuk kebutuhan Anda",
    href: "/tasks/create",
    icon: "/icons/create-icon.svg",
    primary: true,
  },
  {
    label: "Task Helper",
    description: "Pantau task yang Anda bantu",
    href: "/helper-tasks",
    icon: "/icons/helper-icon.svg",
  },
  {
    label: "Pesan",
    description: "Percakapan dengan pengguna",
    href: "/messages",
    icon: "/icons/messages-icon.svg",
  },
];

interface Props {
  onOpenSupport?: () => void;
}

export default function DesktopSidebar({
  onOpenSupport,
}: Props) {
  const [hasUnread, setHasUnread] =
    useState(false);

  const [userProfile, setUserProfile] =
    useState<{
      full_name: string;
      avatar_url?: string;
    } | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    async function loadUnread() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } =
        await supabase
          .from("users")
          .select(
            `
              full_name,
              avatar_url
            `,
          )
          .eq("id", user.id)
          .single();

      if (profile) {
        setUserProfile(profile);
      }

      const { data } = await supabase
        .from("conversations")
        .select(
          `
            id,
            owner_id,
            helper_id,
            owner_unread_count,
            helper_unread_count,
            last_message_at,
            created_at
          `,
        );

      if (!data) return;

      const latestByOtherUser =
        new Map<
          string,
          (typeof data)[number]
        >();

      for (const conversation of data) {
        const isOwner =
          conversation.owner_id === user.id;

        const otherUserId = isOwner
          ? conversation.helper_id
          : conversation.owner_id;

        const existing =
          latestByOtherUser.get(
            otherUserId,
          );

        if (!existing) {
          latestByOtherUser.set(
            otherUserId,
            conversation,
          );

          continue;
        }

        const currentTimestamp =
          new Date(
            conversation.last_message_at ||
              conversation.created_at,
          ).getTime();

        const existingTimestamp =
          new Date(
            existing.last_message_at ||
              existing.created_at,
          ).getTime();

        if (
          currentTimestamp >
          existingTimestamp
        ) {
          latestByOtherUser.set(
            otherUserId,
            conversation,
          );
        }
      }

      const hasUnreadMessage =
        Array.from(
          latestByOtherUser.values(),
        ).some((conversation) => {
          const isOwner =
            conversation.owner_id ===
            user.id;

          return isOwner
            ? (conversation.owner_unread_count ||
                0) > 0
            : (conversation.helper_unread_count ||
                0) > 0;
        });

      setHasUnread(
        hasUnreadMessage,
      );
    }

    loadUnread();

    const channel = supabase.channel(
      "sidebar-unread",
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
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function isMenuActive(
    href: string,
  ) {
    if (href === "/home") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  }

  const userInitial =
    userProfile?.full_name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-40
        hidden
        h-screen
        w-70
        flex-col
        border-r
        border-slate-200/80
        bg-white
        lg:flex
      "
    >
      {/* BRAND */}
      <div
        className="
          shrink-0
          px-5
          pb-5
          pt-7
        "
      >
        <Link
          href="/home"
          className="
            flex
            justify-center
          "
        >
          <Image
            src="/logo_brand.svg"
            alt="HelpMe"
            width={180}
            height={51}
            priority
            className="h-auto w-40"
          />
        </Link>

        <p
          className="mt-2 text-center text-[10px] font-medium tracking-wide text-slate-400">
        </p>
      </div>

      {/* NAVIGATION */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          pb-4
        "
      >
        <div
          className="
            mb-2
            px-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
        >
          Menu Utama
        </div>

        <nav className="space-y-1.5">
          {menus.map((menu) => {
            const active =
              isMenuActive(
                menu.href,
              );

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  px-3
                  py-3
                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        border-indigo-100
                        bg-indigo-50
                        shadow-[0_5px_18px_rgba(79,70,229,0.06)]
                      `
                      : menu.primary
                        ? `
                          border-emerald-100
                          bg-emerald-50/60
                          hover:border-emerald-200
                          hover:bg-emerald-50
                        `
                        : `
                          border-transparent
                          bg-transparent
                          hover:border-slate-200
                          hover:bg-slate-50
                        `
                  }
                `}
              >
                {/* ACTIVE INDICATOR */}
                {active && (
                  <span
                    className="
                      absolute
                      -left-1
                      top-1/2
                      h-6
                      w-1
                      -translate-y-1/2
                      rounded-full
                      bg-indigo-600
                    "
                  />
                )}

                {/* ORIGINAL NAV ICON */}
                <div
                  className={`
                    relative
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    transition-colors

                    ${
                      active
                        ? "bg-white"
                        : menu.primary
                          ? "bg-white"
                          : "bg-slate-50 group-hover:bg-white"
                    }
                  `}
                >
                  <Image
                    src={menu.icon}
                    alt={menu.label}
                    width={24}
                    height={24}
                    className="
                      h-5.5
                      w-5.5
                      object-contain
                    "
                  />

                  {menu.href ===
                    "/messages" &&
                    hasUnread && (
                      <span
                        className="
                          absolute
                          right-1
                          top-1
                          h-2
                          w-2
                          rounded-full
                          bg-red-500
                          ring-2
                          ring-white
                        "
                      />
                    )}
                </div>

                {/* CONTENT */}
                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <p
                      className={`
                        truncate
                        text-[13px]
                        font-bold

                        ${
                          active
                            ? "text-indigo-700"
                            : menu.primary
                              ? "text-emerald-700"
                              : "text-slate-700"
                        }
                      `}
                    >
                      {menu.label}
                    </p>

                    {menu.href ===
                      "/messages" &&
                      hasUnread && (
                        <span
                          className="
                            rounded-full
                            bg-red-50
                            px-1.5
                            py-0.5
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-red-600
                          "
                        >
                          Baru
                        </span>
                      )}
                  </div>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[9px]
                      leading-4
                      text-slate-400
                    "
                  >
                    {menu.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM AREA */}
      <div
        className="
          shrink-0
          border-t
          border-slate-100
          bg-slate-50/40
          p-4
        "
      >
        {/* SUPPORT */}
        <button
          type="button"
          onClick={() =>
            onOpenSupport?.()
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            border
            border-transparent
            px-3
            py-2.5
            text-left
            transition
            hover:border-slate-200
            hover:bg-white
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              shadow-sm
            "
          >
            <Image
              src="/icons/support.svg"
              alt="Support HelpMe"
              width={20}
              height={20}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[12px]
                font-bold
                text-slate-700
              "
            >
              Support HelpMe
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-slate-400
              "
            >
              Support Helpme agar terus bergembang
            </p>
          </div>
        </button>

        {/* PROFILE */}
        <Link
          href="/profile"
          className={`
            mt-2
            flex
            items-center
            gap-3
            rounded-2xl
            border
            px-3
            py-3
            transition-all

            ${
              pathname === "/profile" ||
              pathname.startsWith(
                "/profile/",
              )
                ? `
                  border-indigo-100
                  bg-indigo-50
                `
                : `
                  border-slate-200
                  bg-white
                  hover:border-indigo-100
                  hover:shadow-sm
                `
            }
          `}
        >
          {userProfile?.avatar_url ? (
            <img
              src={
                userProfile.avatar_url
              }
              alt={
                userProfile.full_name
              }
              className="
                h-10
                w-10
                shrink-0
                rounded-full
                border
                border-slate-200
                object-cover
              "
            />
          ) : (
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-indigo-100
                text-sm
                font-black
                text-indigo-700
              "
            >
              {userInitial}
            </div>
          )}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate
                text-[12px]
                font-bold
                text-slate-800
              "
            >
              {userProfile?.full_name ||
                "Profil Saya"}
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                font-medium
                text-slate-400
              "
            >
              Lihat dan kelola profil
            </p>
          </div>

          <span
            aria-hidden="true"
            className="
              text-lg
              leading-none
              text-slate-300
            "
          >
            ›
          </span>
        </Link>
      </div>
    </aside>
  );
}