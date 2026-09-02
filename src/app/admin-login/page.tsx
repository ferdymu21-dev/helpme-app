"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

interface CurrentUserAccessState {
  role: string | null;
  is_admin: boolean | null;
  is_banned: boolean | null;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const {
    setUser,
    setRole,
    setLoading: setAuthLoading,
  } = useAuthStore();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail =
      email.trim();

    if (
      !normalizedEmail ||
      !password
    ) {
      setErrorMessage(
        "Masukkan email dan kata sandi admin.",
      );

      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: authData,
        error: signInError,
      } = await supabase.auth
        .signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (
        signInError ||
        !authData.user ||
        !authData.session
      ) {
        setErrorMessage(
          signInError?.message ||
            "Email atau kata sandi tidak sesuai.",
        );

        return;
      }

      /*
       * Session sudah tersedia dari signInWithPassword().
       *
       * Tidak perlu auth.getUser() kedua di sini.
       * Access-state selalu ditentukan database
       * menggunakan auth.uid().
       */
      const {
        data: accessState,
        error: accessError,
      } = await supabase
        .rpc(
          "get_current_user_access_state",
        )
        .single<CurrentUserAccessState>();

      if (
        accessError ||
        !accessState
      ) {
        await supabase.auth.signOut();

        setUser(null);
        setRole(null);
        setAuthLoading(false);

        setErrorMessage(
          "Gagal memverifikasi akses administrator. Silakan coba kembali.",
        );

        return;
      }

      if (accessState.is_banned) {
        await supabase.auth.signOut();

        setUser(null);
        setRole(null);
        setAuthLoading(false);

        setErrorMessage(
          "Akun administrator ini telah diblokir.",
        );

        return;
      }

      if (
        !accessState.is_admin ||
        accessState.role !== "ADMIN"
      ) {
        await supabase.auth.signOut();

        setUser(null);
        setRole(null);
        setAuthLoading(false);

        setErrorMessage(
          "Akun ini tidak memiliki akses administrator.",
        );

        return;
      }

      /*
       * Sinkronkan global auth state SEBELUM
       * pindah ke halaman /admin.
       *
       * Ini menghilangkan race antara:
       * admin-login → AuthProvider → AdminGuard.
       */
      setUser(
        authData.user,
      );

      setRole(
        accessState.role,
      );

      setAuthLoading(false);

      router.replace(
        "/admin",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login administrator gagal. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-slate-950
        px-4
        py-10
        sm:px-6
        lg:px-8
      "
    >
      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
        "
      >
        <div
          className="
            absolute
            left-1/2
            -top-55
            h-130
            w-130
            -translate-x-1/2
            rounded-full
            bg-blue-600/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-55
            -right-37.5
            h-115
            w-115
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          grid
          w-full
          max-w-5xl
          overflow-hidden
          rounded-4xl
          border
          border-white/10
          bg-white
          shadow-2xl
          shadow-black/30
          lg:grid-cols-[0.95fr_1.05fr]
        "
      >
        {/* LEFT PANEL */}
        <section
          className="
            relative
            hidden
            min-h-162.5
            flex-col
            justify-between
            overflow-hidden
            bg-slate-900
            p-10
            text-white
            lg:flex
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-blue-500/20
              blur-3xl
            "
          />

          <div className="relative z-10">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-slate-300
                transition
                hover:text-white
              "
            >
              <span aria-hidden="true">
                ←
              </span>

              Kembali ke Helpme
            </Link>

            <div className="mt-16">
              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-blue-200
                "
              >
                Helpme Administration
              </div>

              <h1
                className="
                  mt-6
                  max-w-md
                  text-4xl
                  font-black
                  leading-tight
                  tracking-tight
                "
              >
                Kelola Helpme
                dengan aman dan
                terpusat.
              </h1>

              <p
                className="
                  mt-5
                  max-w-md
                  text-sm
                  leading-7
                  text-slate-300
                "
              >
                Portal khusus administrator
                untuk mengelola pengguna,
                verifikasi, laporan, tugas,
                kampanye, iklan, dan aktivitas
                operasional platform.
              </p>
            </div>
          </div>

          <div
            className="
              relative
              z-10
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
              backdrop-blur
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/15
                  text-lg
                "
              >
                🔐
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Area terbatas
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-400
                  "
                >
                  Hanya akun dengan
                  otorisasi administrator
                  yang dapat mengakses
                  dashboard ini.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LOGIN PANEL */}
        <section
          className="
            flex
            min-h-162.5
            items-center
            bg-white
            px-6
            py-10
            sm:px-10
            lg:px-14
          "
        >
          <div className="mx-auto w-full max-w-md">
            {/* MOBILE BRAND */}
            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="
                  text-sm
                  font-medium
                  text-slate-500
                  hover:text-slate-900
                "
              >
                ← Kembali ke Helpme
              </Link>
            </div>

            <div
              className="
                mb-8
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-950
                  text-base
                  font-black
                  text-white
                  shadow-lg
                  shadow-slate-900/15
                "
              >
                H
              </div>

              <div>
                <p
                  className="
                    text-lg
                    font-black
                    tracking-tight
                    text-slate-950
                  "
                >
                  Helpme
                </p>

                <p
                  className="
                    text-xs
                    font-medium
                    text-slate-400
                  "
                >
                  Admin Portal
                </p>
              </div>
            </div>

            <div>
              <h2
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-slate-950
                "
              >
                Selamat datang
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Masuk menggunakan akun
                administrator Helpme.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3.5
                  text-sm
                  leading-6
                  text-red-700
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-0.5
                      font-bold
                    "
                  >
                    !
                  </span>

                  <span>
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="mt-7"
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Email administrator
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value,
                    );

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="admin@helpme.id"
                  autoComplete="email"
                  inputMode="email"
                  disabled={loading}
                  className="
                    mt-2.5
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    text-slate-950
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-slate-500
                    focus:ring-4
                    focus:ring-slate-100
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                  "
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="admin-password"
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Kata sandi
                </label>

                <div className="relative mt-2.5">
                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      );

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      pr-20
                      text-sm
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-slate-500
                      focus:ring-4
                      focus:ring-slate-100
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    disabled={loading}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      px-2
                      py-1
                      text-xs
                      font-semibold
                      text-slate-500
                      transition
                      hover:bg-slate-100
                      hover:text-slate-900
                      disabled:cursor-not-allowed
                    "
                  >
                    {showPassword
                      ? "Sembunyikan"
                      : "Lihat"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-7
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-950
                  px-4
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-slate-900/15
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Memverifikasi akses..."
                  : "Masuk ke Dashboard"}
              </button>
            </form>

            <div
              className="
                mt-8
                border-t
                border-slate-100
                pt-6
              "
            >
              <p
                className="
                  text-center
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Akses portal dicatat dan
                dibatasi hanya untuk akun
                administrator yang
                terotorisasi.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}