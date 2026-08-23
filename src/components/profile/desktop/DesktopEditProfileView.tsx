"use client";

import type { Dispatch, SetStateAction } from "react";

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl?: string;
}

interface Props {
  profile: ProfileData;

  setProfile: Dispatch<SetStateAction<ProfileData>>;

  loading: boolean;

  avatarPreview: string;

  onAvatarChange: (file: File) => void;

  onSave: () => void;
}

export default function DesktopEditProfileView({
  profile,
  setProfile,
  avatarPreview,
  onAvatarChange,
  onSave,
}: Props) {
  
  return (
    <main
      className="
        hidden
        min-h-screen
        bg-slate-50
        lg:block
      "
    >
      <div className="mx-auto max-w-6xl px-10 py-10">
        {/* HEADER */}
        <div>
          <h1
            className="
              text-5xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Edit Profile
          </h1>

          <p
            className="
              mt-4
              text-lg
              text-slate-500
            "
          >
            Lengkapi profile dan reputasi akun kamu.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div
            className="
              rounded-4xl
              bg-white
              p-8
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >
            {/* AVATAR */}
            <div
              className="
    flex
    h-28
    w-28
    items-center
    justify-center
    overflow-hidden
    rounded-full
    bg-indigo-100
    text-4xl
    font-black
    text-indigo-700
  "
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="
        h-full
        w-full
        object-cover
      "
                />
              ) : (
                profile.fullName?.charAt(0)?.toUpperCase()
              )}
            </div>

            <label
              className="
    mt-4
    inline-flex
    cursor-pointer
    rounded-xl
    border
    border-slate-200
    bg-white
    px-4
    py-2
    text-sm
    font-semibold
    text-slate-700
  "
            >
              Pilih Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  onAvatarChange(file);
                }}
              />
            </label>

            <div className="mt-6">
              <h2
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                {profile.fullName || "User"}
              </h2>

              <p
                className="
                  mt-2
                  text-slate-500
                "
              >
                @{profile.username}
              </p>
            </div>

            {/* PREVIEW */}
            <div
              className="
                mt-8
                rounded-3xl
                bg-slate-50
                p-5
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-500
                "
              >
                Preview Bio
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-slate-600
                "
              >
                {profile.bio || "Belum ada bio"}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              col-span-2
              rounded-4xl
              bg-white
              p-8
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >
            <div className="space-y-6">
              {/* FULL NAME */}
              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Full Name
                </label>

                <input
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      fullName: e.target.value,
                    })
                  }
                  className="
                    mt-2
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    outline-none
                    transition
                    focus:border-indigo-400
                  "
                />
              </div>

              {/* USERNAME */}
              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Username
                </label>

                <input
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      username: e.target.value,
                    })
                  }
                  className="
                    mt-2
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    outline-none
                    transition
                    focus:border-indigo-400
                  "
                />
              </div>

              {/* BIO */}
              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Bio
                </label>

                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value,
                    })
                  }
                  className="
                    mt-2
                    h-36
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    outline-none
                    transition
                    focus:border-indigo-400
                  "
                />
              </div>

              {/* LOCATION */}
              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Location
                </label>

                <input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: e.target.value,
                    })
                  }
                  className="
                    mt-2
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    outline-none
                    transition
                    focus:border-indigo-400
                  "
                />
              </div>

              {/* BUTTON */}
              <button
                onClick={onSave}
                className="
                  mt-4
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-900
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                "
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}