"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import { supabase } from "@/lib/supabase/client";

export default function SecuritySettingsPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    googleConnected,
    setGoogleConnected,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    sent,
    setSent,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadAccount =
    useCallback(async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          setEmail("");
          setGoogleConnected(false);

          return;
        }

        setEmail(user.email ?? "");

        setGoogleConnected(
          user.identities?.some(
            (identity) =>
              identity.provider ===
              "google",
          ) ?? false,
        );
      } catch (error) {
        console.error(error);

        setErrorMessage(
          "Gagal memuat informasi keamanan akun.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadAccount();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAccount]);

  async function handleSendReset() {
    if (
      sending ||
      !email
    ) {
      return;
    }

    try {
      setSending(true);
      setErrorMessage("");

      const redirectTo =
        `${window.location.origin}/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo,
          },
        );

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error &&
          error.message
          ? error.message
          : "Gagal mengirim tautan keamanan. Silakan coba kembali.",
      );
    } finally {
      setSending(false);
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
          max-w-3xl
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
            href="/settings"
            aria-label="Kembali ke pengaturan"
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
            <h1
              className="
                text-lg
                font-black
                tracking-tight
                text-slate-900
                lg:text-3xl
              "
            >
              Kata Sandi & Keamanan
            </h1>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
                lg:mt-2
                lg:text-sm
              "
            >
              Kelola akses dan keamanan
              akun HelpMe Anda.
            </p>
          </div>
        </header>

        {/* SECURITY HERO */}
        <section
          className="
            mt-6
            rounded-[28px]
            border
            border-indigo-100
            bg-white
            p-5
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            sm:p-6
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
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <ShieldCheck
                className="h-6 w-6"
                strokeWidth={2}
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-black
                  text-slate-900
                "
              >
                Keamanan akun
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Perubahan kata sandi
                dilakukan melalui tautan
                aman yang dikirim ke email
                akun Anda.
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT EMAIL */}
        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Mail
              className="
                h-5
                w-5
                text-slate-500
              "
              strokeWidth={2}
            />

            <div>
              <h2
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Email akun
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Tautan keamanan akan
                dikirim ke alamat ini.
              </p>
            </div>
          </div>

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              py-3.5
            "
          >
            {loading ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-slate-500
                "
              >
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />

                Memuat email...
              </div>
            ) : (
              <p
                className="
                  break-all
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {email ||
                  "Email tidak tersedia"}
              </p>
            )}
          </div>

          {googleConnected && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50
                p-4
              "
            >
              <CheckCircle2
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-blue-600
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    text-blue-800
                  "
                >
                  Google terhubung
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-blue-700
                  "
                >
                  Anda tetap dapat masuk
                  menggunakan Google meskipun
                  membuat atau memperbarui
                  kata sandi HelpMe.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* PASSWORD */}
        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
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
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-600
              "
            >
              <KeyRound
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div>
              <h2
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Ubah kata sandi
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                HelpMe akan mengirimkan
                tautan ke email Anda.
                Buka tautan tersebut untuk
                membuat kata sandi baru.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="
                mt-5
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-xs
                leading-5
                text-red-700
              "
            >
              {errorMessage}
            </div>
          )}

          {sent && (
            <div
              className="
                mt-5
                flex
                gap-3
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                p-4
              "
            >
              <CheckCircle2
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-emerald-600
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-emerald-800
                  "
                >
                  Tautan berhasil dikirim
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-emerald-700
                  "
                >
                  Periksa email Anda dan
                  gunakan tautan tersebut
                  untuk membuat kata sandi
                  baru.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSendReset}
            disabled={
              loading ||
              sending ||
              !email
            }
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
              px-5
              text-sm
              font-bold
              text-white
              shadow-[0_8px_20px_rgba(79,70,229,0.18)]
              transition
              hover:bg-indigo-700
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {sending ? (
              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />
            ) : (
              <LockKeyhole
                className="h-4 w-4"
                strokeWidth={2}
              />
            )}

            {sending
              ? "Mengirim..."
              : sent
                ? "Kirim Ulang Tautan"
                : "Kirim Tautan Ubah Kata Sandi"}
          </button>
        </section>

        {/* EXPLANATION */}
        <div
          className="
            mt-6
            rounded-2xl
            bg-slate-100
            p-4
            text-xs
            leading-5
            text-slate-500
          "
        >
          Jangan pernah membagikan tautan
          reset atau kata sandi Anda kepada
          pengguna lain. Tim HelpMe tidak
          akan meminta kata sandi melalui
          chat.
        </div>
      </div>

      <div className="lg:hidden">
        <MobileBottomNavbar />
      </div>
    </main>
  );
}