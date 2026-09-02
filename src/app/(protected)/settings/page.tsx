"use client";

import {
  type ReactNode,
  useState,
} from "react";

import Link from "next/link";

import type { LucideIcon } from "lucide-react";

import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Loader2,
  LockKeyhole,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
} from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import { logout } from "@/features/auth/services/auth.service";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

function getVerificationPresentation(
  status?: string,
) {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Terverifikasi",
        description:
          "Identitas Anda telah berhasil diverifikasi.",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "PENDING":
      return {
        label: "Sedang Ditinjau",
        description:
          "Dokumen Anda sedang diperiksa oleh tim HelpMe.",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "REJECTED":
      return {
        label: "Perlu Diperbaiki",
        description:
          "Verifikasi sebelumnya ditolak. Periksa dan kirim ulang dokumen.",
        className:
          "border-red-200 bg-red-50 text-red-700",
      };

    default:
      return {
        label: "Belum Diverifikasi",
        description:
          "Verifikasi identitas untuk meningkatkan kepercayaan akun.",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

export default function SettingsPage() {
  const {
    user,
    loading,
  } = useCurrentUser();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const verification =
    getVerificationPresentation(
      user?.verificationStatus,
    );

  const initial =
    user?.fullName
      ?.trim()
      .charAt(0)
      .toUpperCase() || "U";

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    const confirmed =
      window.confirm(
        "Keluar dari akun HelpMe?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoggingOut(true);

      await logout();

      window.location.href =
        "/login";
    } catch (error) {
      console.error(error);

      alert(
        "Gagal keluar dari akun",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        pb-28
        lg:pb-14
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          h-72
          bg-linear-to-b
          from-indigo-50
          via-slate-50/70
          to-transparent
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-4xl
          px-5
          py-5
          sm:px-6
          lg:px-8
          lg:py-10
        "
      >
        {/* HEADER */}
        <header
          className="
            flex
            items-center
            gap-3
          "
        >
          <Link
            href="/profile"
            aria-label="Kembali ke profil"
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
              hover:bg-slate-50
              active:scale-95
            "
          >
            <ArrowLeft
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </Link>

          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Settings
                className="
                  hidden
                  h-4
                  w-4
                  text-indigo-600
                  lg:block
                "
              />

              <h1
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-900
                  lg:text-3xl
                "
              >
                Pengaturan
              </h1>
            </div>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
                lg:mt-2
                lg:text-sm
              "
            >
              Kelola akun, keamanan,
              dan identitas Anda.
            </p>
          </div>
        </header>

        {/* USER SUMMARY */}
        <section
          className="
            mt-6
            rounded-[28px]
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            lg:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-indigo-100
                text-xl
                font-black
                text-indigo-700
              "
            >
              {loading ? (
                <Loader2
                  className="
                    h-5
                    w-5
                    animate-spin
                  "
                />
              ) : (
                initial
              )}
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-base
                  font-black
                  text-slate-900
                "
              >
                {loading
                  ? "Memuat profil..."
                  : user?.fullName ||
                    "Pengguna HelpMe"}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  text-slate-500
                "
              >
                {user?.username ||
                  "Kelola informasi akun HelpMe Anda"}
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <SettingsSection
          title="Akun"
          description="Kelola informasi profil dan identitas akun."
        >
          <SettingsItem
            href="/profile/edit"
            icon={Pencil}
            title="Edit Profil"
            description="Ubah nama, username, bio, foto profil, dan lokasi."
          />

          <SettingsItem
            href="/profile/verification"
            icon={ShieldCheck}
            title="Verifikasi Akun"
            description={
              verification.description
            }
            trailing={
              <span
                className={`
                  inline-flex
                  shrink-0
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[9px]
                  font-bold
                  ${verification.className}
                `}
              >
                {verification.label}
              </span>
            }
          />
        </SettingsSection>

        {/* SECURITY */}
        <SettingsSection
          title="Keamanan"
          description="Kelola keamanan dan akses ke akun Anda."
        >
          <SettingsItem
            href="/settings/security"
            icon={LockKeyhole}
            title="Kata Sandi & Keamanan"
            description="Ubah atau pulihkan kata sandi akun dengan aman."
          />
        </SettingsSection>

        {/* ACCOUNT SESSION */}
        <section className="mt-7">
          <div
            className="
              mb-3
              px-1
            "
          >
            <h2
              className="
                text-xs
                font-black
                tracking-wide
                text-slate-500
                uppercase
              "
            >
              Sesi Akun
            </h2>
          </div>

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_24px_rgba(15,23,42,0.035)]
            "
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                flex
                w-full
                items-center
                gap-4
                px-4
                py-4
                text-left
                transition
                hover:bg-red-50/60
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:px-5
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-600
                "
              >
                {loggingOut ? (
                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                    "
                  />
                ) : (
                  <LogOut
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-sm
                    font-bold
                    text-red-700
                  "
                >
                  Keluar dari Akun
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Akhiri sesi pada perangkat
                  ini dan kembali ke halaman
                  masuk.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* INFO */}
        <div
          className="
            mt-7
            flex
            gap-3
            rounded-2xl
            border
            border-indigo-100
            bg-indigo-50/70
            p-4
          "
        >
          <BadgeCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-indigo-600
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-indigo-800
            "
          >
            Beberapa pengaturan tambahan
            seperti preferensi notifikasi
            akan ditambahkan setelah
            fiturnya siap digunakan. Menu
            yang tampil saat ini seluruhnya
            sudah dapat digunakan.
          </p>
        </div>
      </div>

      <div className="lg:hidden">
        <MobileBottomNavbar />
      </div>
    </main>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 px-1">
        <h2
          className="
            text-xs
            font-black
            tracking-wide
            text-slate-500
            uppercase
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-slate-400
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          divide-y
          divide-slate-100
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
        "
      >
        {children}
      </div>
    </section>
  );
}

function SettingsItem({
  href,
  icon: Icon,
  title,
  description,
  trailing,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        items-center
        gap-4
        px-4
        py-4
        transition
        hover:bg-slate-50
        sm:px-5
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-indigo-50
          text-indigo-600
          transition
          group-hover:bg-indigo-100
        "
      >
        <Icon
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-sm
            font-bold
            text-slate-800
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          gap-2
        "
      >
        {trailing}

        <ChevronRight
          className="
            h-4
            w-4
            text-slate-300
            transition
            group-hover:translate-x-0.5
            group-hover:text-slate-500
          "
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}