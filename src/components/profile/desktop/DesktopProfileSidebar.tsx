"use client";

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
  return (
    <aside className="overflow-hidden rounded-[36px] bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
      {/* COVER */}
      <div
        className="
          relative
          h-56
          bg-linear-to-br
          from-indigo-500
          via-indigo-400
          to-violet-400
        "
      >
        <div
          className="
            absolute
            -left-10
            -top-10
            h-36
            w-36
            rounded-full
            bg-white/15
          "
        />

        <div
          className="
            absolute
            right-8
            top-8
            h-24
            w-24
            rounded-full
            border
            border-white/20
          "
        />

        {/* AVATAR */}
        <div className="absolute left-1/2 bottom-0 z-20 -translate-x-1/2 translate-y-1/2">

          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="h-45 w-45 rounded-full border-[6px] border-white object-cover shadow-xl"/>
          ) : (
            <div
              className="
        flex
        h-32
        w-32
        items-center
        justify-center
        rounded-full
        border-[6px]
        border-white
        bg-indigo-100
        text-5xl
        font-black
        text-indigo-700
      "
            >
              {profile.initials}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
         pt-20
         flex
         flex-col
         items-center
         px-8
         pb-8
         "
      >
        {/* NAME */}
        <div
          className="mt-10 w-full text-center">
            
          <h1
            className="text-xl font-black tracking-tight text-slate-900">

            {profile.fullName}
          </h1>

          <p
            className="mt-2 text-lg text-slate-500">
            {profile.username}
          </p>
        </div>

        {/* BIO */}
        <p
          className="
            mt-8
            text-center
            leading-8
            text-slate-500
          "
        >
          {profile.bio ||
            "Helper aktif yang siap membantu berbagai kebutuhan harian pengguna."}
        </p>

        {/* LOCATION */}

        {profile.location && (
          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-medium
              text-slate-500
            "
          >
            📍 {profile.location}
          </div>
        )}

        

        {/* BUTTON */}
        {!isPublicProfile ? (
          <button
            onClick={onEdit}
            className="
              mt-10
              flex
              h-14
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-slate-900
              text-base
              font-semibold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            ✏ Edit Profile
          </button>
        ) : (
          <button
            onClick={onReport}
            className="
              mt-8
              flex
              h-14
              w-full
              items-center
              justify-center
              rounded-2xl
              border
              border-red-300
              bg-red-50
              text-base
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
            "
          >
            🚩 Laporkan Pengguna
          </button>
        )}
      </div>
    </aside>
  );
}