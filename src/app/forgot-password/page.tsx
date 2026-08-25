"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";

import AuthShell from "@/features/auth/components/AuthShell";

import {
  supabase,
} from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    sentEmail,
    setSentEmail,
  ] = useState("");

  async function handleReset(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    const normalizedEmail =
      email.trim();

    setErrorMessage("");

    if (!normalizedEmail) {
      setErrorMessage(
        "Masukkan alamat email akun HelpMe Anda.",
      );

      return;
    }

    try {
      setLoading(true);

      const redirectTo =
        `${window.location.origin}/reset-password`;

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo,
          },
        );

      if (error) {
        throw error;
      }

      setSentEmail(
        normalizedEmail,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      console.error(error);

      setErrorMessage(
        message ||
          "Gagal mengirim tautan reset. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sentEmail) {
    return (
      <AuthShell
        title="Periksa email Anda"
        description="Kami telah mengirim tautan untuk membuat kata sandi baru."
      >
        <div
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-emerald-50/70
            p-6
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-emerald-100
              text-emerald-600
            "
          >
            <CheckCircle2
              className="h-7 w-7"
              aria-hidden="true"
            />
          </div>

          <h3
            className="
              mt-5
              text-xl
              font-bold
              text-slate-950
            "
          >
            Tautan reset telah dikirim
          </h3>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-600
            "
          >
            Periksa kotak masuk email
          </p>

          <p
            className="
              mt-1
              break-all
              text-sm
              font-bold
              text-slate-900
            "
          >
            {sentEmail}
          </p>

          <p
            className="
              mt-4
              text-sm
              leading-6
              text-slate-500
            "
          >
            Klik tautan pada email tersebut untuk
            membuat kata sandi baru. Periksa folder
            spam apabila email belum terlihat.
          </p>
        </div>

        <Link
          href="/login"
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            text-sm
            font-semibold
            text-primary-600
            transition
            hover:text-primary-500
          "
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Kembali ke halaman masuk
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Lupa kata sandi?"
      description="Masukkan email yang terhubung dengan akun HelpMe. Kami akan mengirim tautan untuk membuat kata sandi baru."
    >
      <form
        onSubmit={handleReset}
        className="space-y-5"
        noValidate
      >
        {errorMessage && (
          <div
            role="alert"
            className="
              flex
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              leading-6
              text-red-700
            "
          >
            <AlertCircle
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
              "
              aria-hidden="true"
            />

            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="forgot-email"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Email
          </label>

          <div className="relative">
            <Mail
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-slate-400
              "
              aria-hidden="true"
            />

            <input
              id="forgot-email"
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
              placeholder="nama@email.com"
              autoComplete="email"
              inputMode="email"
              required
              disabled={loading}
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                py-3.5
                pl-12
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-primary-500
                focus:bg-white
                focus:ring-4
                focus:ring-primary-100
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:text-base
              "
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-primary-600
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-primary-500
            focus:outline-none
            focus:ring-4
            focus:ring-primary-100
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:text-base
          "
        >
          {loading && (
            <LoaderCircle
              className="
                h-5
                w-5
                animate-spin
              "
              aria-hidden="true"
            />
          )}

          {loading
            ? "Mengirim..."
            : "Kirim tautan reset"}
        </button>
      </form>

      <Link
        href="/login"
        className="
          mt-7
          flex
          items-center
          justify-center
          gap-2
          text-sm
          font-semibold
          text-primary-600
          transition
          hover:text-primary-500
        "
      >
        <ArrowLeft
          className="h-4 w-4"
          aria-hidden="true"
        />

        Kembali ke halaman masuk
      </Link>
    </AuthShell>
  );
}