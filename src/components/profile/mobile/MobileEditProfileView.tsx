"use client";

import type { Dispatch, SetStateAction } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  AtSign,
  Camera,
  FileText,
  Loader2,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileEditProfileView({
  profile,
  setProfile,
  loading,
  avatarPreview,
  onAvatarChange,
  onSave,
}: Props) {
  const initial =
    profile.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">
      <div className="px-5 py-5">
        {/* HEADER */}
        <header className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="Kembali ke profil"
            title="Kembali ke profil"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              active:scale-95
            "
          >
            <ArrowLeft
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </Link>

          <div className="min-w-0">
            <h1
              className="
                text-lg
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Edit Profil
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Kelola informasi yang tampil di profil Anda
            </p>
          </div>
        </header>

        {/* AVATAR CARD */}
        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            px-5
            py-6
            shadow-[0_10px_30px_rgba(15,23,42,0.04)]
          "
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <div
                className="
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-4
                  border-white
                  bg-indigo-100
                  text-3xl
                  font-black
                  text-indigo-700
                  shadow-[0_8px_24px_rgba(15,23,42,0.12)]
                "
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div
                className="
                  absolute
                  right-0
                  bottom-1
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border-4
                  border-white
                  bg-indigo-600
                  text-white
                "
              >
                <Camera
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </div>
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">
              Foto Profil
            </h2>

            <p className="mt-1 text-center text-xs text-slate-500">
              Pilih foto yang jelas agar profil lebih mudah dikenali.
            </p>

            <label
              className="
                mt-4
                inline-flex
                cursor-pointer
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-700
                transition
                active:scale-[0.98]
              "
            >
              <Camera
                className="h-4 w-4"
                strokeWidth={2}
              />

              Ubah Foto

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={loading}
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  onAvatarChange(file);
                }}
              />
            </label>

            <p className="mt-2 text-[10px] text-slate-400">
              Foto akan dikompresi otomatis saat disimpan.
            </p>
          </div>
        </section>

        {/* FORM CARD */}
        <section
          className="
            mt-5
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_10px_30px_rgba(15,23,42,0.04)]
          "
        >
          <div>
            <h2 className="text-base font-black text-slate-900">
              Informasi Profil
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Informasi berikut dapat ditampilkan kepada pengguna lain.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* FULL NAME */}
            <div>
              <label
                htmlFor="mobile-profile-full-name"
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                <UserRound className="h-4 w-4 text-slate-400" />

                Nama Lengkap
              </label>

              <input
                id="mobile-profile-full-name"
                value={profile.fullName}
                disabled={loading}
                placeholder="Masukkan nama lengkap"
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    fullName: event.target.value,
                  })
                }
                className="
                  mt-2.5
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* USERNAME */}
            <div>
              <label
                htmlFor="mobile-profile-username"
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                <AtSign className="h-4 w-4 text-slate-400" />

                Username
              </label>

              <div
                className="
                  mt-2.5
                  flex
                  h-12
                  items-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  transition
                  focus-within:border-indigo-400
                  focus-within:bg-white
                  focus-within:ring-4
                  focus-within:ring-indigo-50
                "
              >
                <span
                  className="
                    flex
                    h-full
                    items-center
                    border-r
                    border-slate-200
                    px-4
                    text-sm
                    font-semibold
                    text-slate-400
                  "
                >
                  @
                </span>

                <input
                  id="mobile-profile-username"
                  value={profile.username}
                  disabled={loading}
                  placeholder="username"
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      username: event.target.value,
                    })
                  }
                  className="
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>
            </div>

            {/* BIO */}
            <div>
              <label
                htmlFor="mobile-profile-bio"
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                <FileText className="h-4 w-4 text-slate-400" />

                Bio
              </label>

              <textarea
                id="mobile-profile-bio"
                value={profile.bio}
                disabled={loading}
                placeholder="Ceritakan sedikit tentang diri Anda..."
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    bio: event.target.value,
                  })
                }
                className="
                  mt-2.5
                  min-h-28
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  text-sm
                  leading-6
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* LOCATION */}
            <div>
              <label
                htmlFor="mobile-profile-location"
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                <MapPin className="h-4 w-4 text-slate-400" />

                Lokasi
              </label>

              <input
                id="mobile-profile-location"
                value={profile.location}
                disabled={loading}
                placeholder="Contoh: Yogyakarta"
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    location: event.target.value,
                  })
                }
                className="
                  mt-2.5
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* SAVE */}
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="
                mt-2
                flex
                h-13
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-indigo-600
                text-sm
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(79,70,229,0.22)]
                transition
                hover:bg-indigo-700
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Menyimpan...
                </>
              ) : (
                <>
                  <Save
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />

                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      <MobileBottomNavbar />
    </main>
  );
}