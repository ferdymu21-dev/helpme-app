"use client";

import Image from "next/image";

import Link from "next/link";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { useRouter } from "next/navigation";

import { useNotificationBadge } from "@/features/notifications/hooks/useNotificationBadge";

interface Props {
  onOpenSupport: () => void;
}

export default function MobileHomeHeader({ onOpenSupport }: Props) {
  const [initials, setInitials] = useState("U");

  const [avatarUrl, setAvatarUrl] = useState("");

  const { hasUnread, unreadCount } = useNotificationBadge();

  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select(
            `
      avatar_url
    `,
          )
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }

        const fullName = user.user_metadata?.full_name;

        if (!fullName) return;

        const words = fullName.split(" ");

        const first = words[0]?.charAt(0) || "";

        const second = words[1]?.charAt(0) || "";

        const result = `${first}${second}`;

        setInitials(result.toUpperCase());
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
    border-slate-200/80
    bg-white/90
    backdrop-blur-xl
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
  px-5
"
      >
        {/* LEFT */}
        <Image
          src="/logo_brand.svg"
          alt="HelpMe Logo"
          width={120}
          height={34}
          priority
          className="h-auto w-30"
        />

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSupport}
            className="
  flex
  h-10
  w-10
  items-center
  justify-center
  rounded-full
  border
  border-slate-200
  bg-white
  shadow-sm
  transition
  hover:border-pink-200
  hover:bg-pink-50
  active:scale-95
"
            title="Support HelpMe"
          >
            <Image
              src="/icons/support.svg"
              alt="Support HelpMe"
              width={20}
              height={20}
              className="h-6 w-6 object-contain"
            />
          </button>

          {/* NOTIFICATION */}
          <div className="relative">
            <button
              onClick={() => router.push("/notifications")}
              className="
  relative
  flex
  h-10
  w-10
  items-center
  justify-center
  rounded-full
  border
  border-slate-200
  bg-white
  shadow-sm
  transition
  hover:bg-slate-50
  active:scale-95
"
            >
              <Image
                src="/icons/notif.svg"
                alt="Notifications"
                width={20}
                height={20}
                className="h-6 w-6"
              />

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
bg-red-500
px-1
text-[10px]
font-bold
leading-none
text-white
"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>

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
  border-2
  border-white
  object-cover
  shadow-sm
  ring-1
  ring-slate-200
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
  bg-indigo-100
  text-xs
  font-black
  text-indigo-700
  shadow-sm
  ring-1
  ring-slate-200
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