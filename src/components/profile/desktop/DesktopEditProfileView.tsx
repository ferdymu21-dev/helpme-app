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
  loading,
  avatarPreview,
  onAvatarChange,
  onSave,
}: Props) {
  const initial =
    profile.fullName?.charAt(0)?.toUpperCase() || "U";

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
        <header>
          <Link
            href="/profile"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={2.2}
            />

            Kembali ke Profil
          </Link>

          <div className="mt-7">
            <h1
              className="
                text-4xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Edit Profil
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-base
                leading-7
                text-slate-500
              "
            >
              Kelola informasi profil yang akan membantu pengguna lain
              mengenal Anda di HelpMe.
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <div
          className="
            mt-8
            grid
            grid-cols-[320px_minmax(0,1fr)]
            items-start
            gap-6
          "
        >
          {/* PROFILE PREVIEW */}
          <aside
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-[0_10px_30px_rgba(15,23,42,0.04)]
            "
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className="
                    flex
                    h-32
                    w-32
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    border-4
                    border-white
                    bg-indigo-100
                    text-4xl
                    font-black
                    text-indigo-700
                    shadow-[0_10px_30px_rgba(15,23,42,0.12)]
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
                    right-1
                    bottom-1
                    flex
                    h-10
                    w-10
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

              <h2
                className="
                  mt-5
                  max-w-full
                  truncate
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                {profile.fullName || "User"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile.username
                  ? `@${profile.username}`
                  : "Username belum diisi"}
              </p>

              <label
                className="
                  mt-5
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
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-100
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

              <p className="mt-2 text-xs text-slate-400">
                Foto akan dikompresi otomatis.
              </p>
            </div>

            {/* LIVE PREVIEW */}
            <div
              className="
                mt-7
                border-t
                border-slate-100
                pt-6
              "
            >
              <p
                className="
                  text-xs
                  font-bold
                  tracking-wide
                  text-slate-400
                  uppercase
                "
              >
                Preview Profil
              </p>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <FileText
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  />

                  <p
                    className="
                      text-sm
                      leading-6
                      text-slate-600
                    "
                  >
                    {profile.bio ||
                      "Bio belum ditambahkan."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin
                    className="h-4 w-4 shrink-0 text-slate-400"
                  />

                  <p className="text-sm text-slate-600">
                    {profile.location ||
                      "Lokasi belum ditambahkan."}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* FORM */}
          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-8
              shadow-[0_10px_30px_rgba(15,23,42,0.04)]
            "
          >
            <div
              className="
                border-b
                border-slate-100
                pb-6
              "
            >
              <h2 className="text-xl font-black text-slate-900">
                Informasi Profil
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Pastikan informasi yang ditampilkan akurat dan mudah
                dipahami pengguna lain.
              </p>
            </div>

            <div className="mt-7 space-y-6">
              {/* NAME + USERNAME */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="desktop-profile-full-name"
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    <UserRound className="h-4 w-4 text-slate-400" />

                    Nama Lengkap
                  </label>

                  <input
                    id="desktop-profile-full-name"
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
                      h-13
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

                <div>
                  <label
                    htmlFor="desktop-profile-username"
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
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
                      h-13
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
                      id="desktop-profile-username"
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
              </div>

              {/* BIO */}
              <div>
                <label
                  htmlFor="desktop-profile-bio"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  <FileText className="h-4 w-4 text-slate-400" />

                  Bio
                </label>

                <textarea
                  id="desktop-profile-bio"
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
                    min-h-36
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
                  htmlFor="desktop-profile-location"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  <MapPin className="h-4 w-4 text-slate-400" />

                  Lokasi
                </label>

                <input
                  id="desktop-profile-location"
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
                    h-13
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

              {/* FOOTER */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-6
                  border-t
                  border-slate-100
                  pt-6
                "
              >
                <p
                  className="
                    max-w-md
                    text-xs
                    leading-5
                    text-slate-400
                  "
                >
                  Perubahan pada profil akan langsung digunakan di
                  seluruh bagian HelpMe setelah berhasil disimpan.
                </p>

                <button
                  type="button"
                  onClick={onSave}
                  disabled={loading}
                  className="
                    flex
                    h-12
                    min-w-48
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-indigo-600
                    px-6
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}