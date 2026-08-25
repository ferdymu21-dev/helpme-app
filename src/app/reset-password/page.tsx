"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import AuthShell from "@/features/auth/components/AuthShell";

import {
  supabase,
} from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (password.length < 8) {
      setPasswordError(
        "Kata sandi minimal 8 karakter.",
      );

      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        "Konfirmasi kata sandi wajib diisi.",
      );

      hasError = true;
    } else if (
      password !==
      confirmPassword
    ) {
      setConfirmPasswordError(
        "Konfirmasi kata sandi tidak cocok.",
      );

      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);

      const {
        error,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "";

      console.error(error);

      const normalizedMessage =
        rawMessage.toLowerCase();

      if (
        normalizedMessage.includes(
          "auth session missing",
        ) ||
        normalizedMessage.includes(
          "session",
        )
      ) {
        setErrorMessage(
          "Tautan reset kata sandi tidak valid atau sesi Anda telah berakhir. Silakan minta tautan reset baru.",
        );

        return;
      }

      setErrorMessage(
        rawMessage ||
          "Gagal memperbarui kata sandi. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Kata sandi berhasil diperbarui"
        description="Kata sandi baru Anda sudah tersimpan dan akun dapat digunakan kembali."
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
            Kata sandi baru sudah aktif
          </h3>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-600
            "
          >
            Anda sekarang dapat melanjutkan
            menggunakan akun HelpMe dengan
            kata sandi baru.
          </p>
        </div>

        <Link
          href="/home"
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
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
            sm:text-base
          "
        >
          Lanjut ke HelpMe
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Buat kata sandi baru"
      description="Masukkan kata sandi baru untuk mengamankan dan memulihkan akses ke akun HelpMe Anda."
    >
      <form
        onSubmit={
          handleResetPassword
        }
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

            <span>
              {errorMessage}
            </span>
          </div>
        )}

        {/* NEW PASSWORD */}
        <div>
          <label
            htmlFor="reset-password"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Kata sandi baru
          </label>

          <div className="relative">
            <LockKeyhole
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
              id="reset-password"
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

                if (passwordError) {
                  setPasswordError("");
                }
              }}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              required
              disabled={loading}
              aria-invalid={
                Boolean(
                  passwordError,
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                py-3.5
                pl-12
                pr-12
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

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              disabled={loading}
              aria-label={
                showPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
              className="
                absolute
                right-3
                top-1/2
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-primary-100
                disabled:opacity-50
              "
            >
              {showPassword ? (
                <EyeOff
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          {passwordError ? (
            <p
              className="
                mt-2
                text-sm
                text-red-600
              "
            >
              {passwordError}
            </p>
          ) : (
            <p
              className="
                mt-2
                text-xs
                text-slate-400
              "
            >
              Gunakan minimal 8 karakter.
            </p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Konfirmasi kata sandi
          </label>

          <div className="relative">
            <LockKeyhole
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
              id="reset-confirm-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value,
                );

                if (
                  confirmPasswordError
                ) {
                  setConfirmPasswordError(
                    "",
                  );
                }
              }}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              required
              disabled={loading}
              aria-invalid={
                Boolean(
                  confirmPasswordError,
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                py-3.5
                pl-12
                pr-12
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

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) =>
                    !current,
                )
              }
              disabled={loading}
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi kata sandi"
                  : "Tampilkan konfirmasi kata sandi"
              }
              className="
                absolute
                right-3
                top-1/2
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-primary-100
                disabled:opacity-50
              "
            >
              {showConfirmPassword ? (
                <EyeOff
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          {confirmPasswordError && (
            <p
              className="
                mt-2
                text-sm
                text-red-600
              "
            >
              {
                confirmPasswordError
              }
            </p>
          )}
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
            ? "Menyimpan..."
            : "Simpan kata sandi baru"}
        </button>
      </form>
    </AuthShell>
  );
}