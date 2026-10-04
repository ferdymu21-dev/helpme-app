"use client";

import Image from "next/image";

import Link from "next/link";

import { useAuthStore } from "@/store/auth.store";

import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { useRouter } from "next/navigation";

import { useNotificationBadge } from "@/features/notifications/hooks/useNotificationBadge";

interface Props {
  onOpenSupport: () => void;
}

export default function MobileHomeHeader({ onOpenSupport }: Props) {
  const [avatarUrl, setAvatarUrl] = useState("");

    const authUser =
    useAuthStore(
      (state) => state.user,
    );

  const userId =
    authUser?.id ?? null;

  const { hasUnread, unreadCount } = useNotificationBadge();

  const router = useRouter();

  const [
    isHeaderVisible,
    setIsHeaderVisible,
  ] = useState(true);

  const lastScrollYRef =
    useRef(0);

  useEffect(() => {
    lastScrollYRef.current =
      Math.max(window.scrollY, 0);

    function handleScroll() {
      const currentScrollY =
        Math.max(window.scrollY, 0);

      if (currentScrollY <= 80) {
        setIsHeaderVisible(true);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      const delta =
        currentScrollY -
        lastScrollYRef.current;

      if (delta >= 12) {
        setIsHeaderVisible(false);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      if (delta <= -12) {
        setIsHeaderVisible(true);

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

    useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const {
          data: profile,
          error,
        } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", userId)
          .single();

        if (
          cancelled ||
          error
        ) {
          if (
            error &&
            !cancelled
          ) {
            console.error(error);
          }

          return;
        }

        setAvatarUrl(
          profile?.avatar_url ??
            "",
        );
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

    const metadataFullName =
    authUser?.user_metadata
      ?.full_name;

  const fullName =
    typeof metadataFullName ===
    "string"
      ? metadataFullName.trim()
      : "";

  const words = fullName
    .split(/\s+/)
    .filter(Boolean);

  const firstInitial =
    words[0]?.charAt(0) ||
    "";

  const secondInitial =
    words[1]?.charAt(0) ||
    "";

  const initials =
    `${firstInitial}${secondInitial}`.toUpperCase() ||
    "U";

  return (
    <header
  className={`
    sticky
    top-0
    z-30
    px-3
    pt-3
    transition-all
    duration-300
    ease-out
    will-change-transform

    ${
      isHeaderVisible
        ? "translate-y-0 opacity-100"
        : "-translate-y-[calc(100%+0.75rem)] pointer-events-none opacity-0"
    }
  `}
>
  <div
    className="
      mx-auto
      flex
      h-15
      max-w-300
      items-center
      justify-between
      rounded-3xl
      border
      border-white/90
      bg-linear-to-r
      from-white
      via-white/95
      to-indigo-50/80
      px-4
      shadow-[0_10px_30px_rgba(15,23,42,0.08)]
      backdrop-blur-xl
      sm:px-5
    "
  >
    {/* LOGO */}
    <Link
      href="/home"
      aria-label="HelpMe"
      className="
        shrink-0
        transition
        active:scale-[0.98]
      "
    >
      <Image
        src="/logo_brand.svg"
        alt="HelpMe"
        width={112}
        height={32}
        priority
        className="
          h-auto
          w-28
        "
      />
    </Link>

    {/* ACTIONS */}
    <div
      className="
        flex
        shrink-0
        items-center
        gap-2.5
      "
    >
      {/* SUPPORT */}
      <button
        type="button"
        onClick={onOpenSupport}
        aria-label="Support HelpMe"
        title="Support HelpMe"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-slate-200/80
          bg-white
          shadow-[0_6px_18px_rgba(15,23,42,0.07)]
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-indigo-200
          hover:shadow-[0_10px_24px_rgba(79,70,229,0.12)]
          active:scale-95
        "
      >
        <Image
          src="/icons/support.svg"
          alt=""
          width={22}
          height={22}
          className="object-contain"
          aria-hidden="true"
        />
      </button>

      {/* NOTIFICATION */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            router.push("/notifications")
          }
          aria-label="Notifikasi"
          title="Notifikasi"
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200/80
            bg-white
            shadow-[0_6px_18px_rgba(15,23,42,0.07)]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-indigo-200
            hover:shadow-[0_10px_24px_rgba(79,70,229,0.12)]
            active:scale-95
          "
        >
          <Image
            src="/icons/notif.svg"
            alt=""
            width={22}
            height={22}
            className="object-contain"
            aria-hidden="true"
          />

          {hasUnread && (
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                flex
                min-h-4.5
                min-w-4.5
                items-center
                justify-center
                rounded-full
                bg-red-500
                px-1
                text-[9px]
                font-black
                leading-none
                text-white
                ring-2
                ring-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* PROFILE */}
      <Link
        href="/profile"
        aria-label="Profil saya"
        title="Profil saya"
        className="
          shrink-0
          rounded-full
          transition
          active:scale-95
        "
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="
              h-10
              w-10
              rounded-full
              border-2
              border-white
              bg-slate-100
              object-cover
              shadow-[0_6px_18px_rgba(15,23,42,0.08)]
              ring-1
              ring-indigo-100
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
              border-2
              border-white
              bg-indigo-50
              text-xs
              font-black
              text-indigo-700
              shadow-[0_6px_18px_rgba(15,23,42,0.08)]
              ring-1
              ring-indigo-100
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