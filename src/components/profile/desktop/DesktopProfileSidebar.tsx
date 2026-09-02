"use client";

import {
  Flag,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react";

interface Props {
  profile: {
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
    location: string;
    initials: string;
  };

  isPublicProfile?: boolean;

  onEdit(): void;
  onReport(): void;
}

export default function DesktopProfileSidebar({
  profile,
  isPublicProfile = false,
  onEdit,
  onReport,
}: Props) {
  const initials =
    profile.initials?.trim() ||
    profile.fullName
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  return (
    <section
      className="
        overflow-hidden
        rounded-4xl
        border
        border-slate-200/80
        bg-white
        shadow-[0_16px_44px_rgba(15,23,42,0.06)]
      "
    >
      {/* COVER */}
      <div
        className="
          relative
          z-0
          h-36
          overflow-hidden
          bg-linear-to-br
          from-indigo-600
          via-indigo-500
          to-violet-500
        "
      >
        <div
          className="
            absolute
            -top-20
            -left-12
            h-52
            w-52
            rounded-full
            bg-white/10
          "
        />

        <div
          className="
            absolute
            -right-16
            bottom-0
            h-44
            w-44
            rounded-full
            border
            border-white/10
            bg-white/5
          "
        />

        <div
          className="
            absolute
            top-6
            right-6
            flex
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-white/10
            px-3
            py-1.5
            text-[10px]
            font-bold
            text-white
            backdrop-blur
          "
        >
          <ShieldCheck
            className="h-3.5 w-3.5"
            strokeWidth={2}
          />

          HelpMe Profile
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-6 pb-6">
        {/* AVATAR */}
         <div className="relative z-20 -mt-16">
          <div
            className="
              mx-auto
              flex
              h-32
              w-32
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border-[5px]
              border-white
              bg-indigo-100
              text-4xl
              font-black
              text-indigo-700
              shadow-[0_10px_30px_rgba(15,23,42,0.14)]
            "
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Foto profil ${profile.fullName}`}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* IDENTITY */}
        <div className="mt-4 text-center">
          <h2
            className="
              text-2xl
              font-black
              tracking-tight
              text-slate-950
            "
          >
            {profile.fullName ||
              "Pengguna HelpMe"}
          </h2>

          {profile.username && (
            <p
              className="
                mt-1.5
                text-sm
                font-medium
                text-slate-500
              "
            >
              {profile.username}
            </p>
          )}

          {profile.location && (
            <div
              className="
                mt-3
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                bg-slate-100
                px-3
                py-1.5
                text-xs
                font-medium
                text-slate-600
              "
            >
              <MapPin
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                "
                strokeWidth={2}
              />

              <span className="truncate">
                {profile.location}
              </span>
            </div>
          )}
        </div>

        {/* BIO */}
        <div
          className="
            mt-5
            rounded-2xl
            bg-slate-50
            px-4
            py-4
          "
        >
          <p
            className="
              text-center
              text-sm
              leading-6
              text-slate-600
            "
          >
            {profile.bio ||
              "Helper aktif yang siap membantu berbagai kebutuhan harian di HelpMe."}
          </p>
        </div>

        {/* PRIMARY ACTION */}
        {!isPublicProfile ? (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="
                mt-5
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-indigo-600
                text-sm
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(79,70,229,0.2)]
                transition
                hover:bg-indigo-700
                active:scale-[0.99]
              "
            >
              <Pencil
                className="h-4 w-4"
                strokeWidth={2.2}
              />

              Edit Profil
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onReport}
            className="
              mt-5
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-red-100
              bg-red-50
              text-xs
              font-bold
              text-red-600
              transition
              hover:bg-red-100
              active:scale-[0.99]
            "
          >
            <Flag
              className="h-4 w-4"
              strokeWidth={2}
            />

            Laporkan Pengguna
          </button>
        )}
      </div>
    </section>
  );
}