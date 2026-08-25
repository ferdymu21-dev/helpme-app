"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { login } from "../services/auth.service";

export default function LoginForm() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");

    try {
      setLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      window.location.href = "/home";
    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "";

      if (
        rawMessage
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
        setErrorMessage(
          "Email atau kata sandi yang Anda masukkan tidak sesuai.",
        );

        return;
      }

      if (
        rawMessage
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        setErrorMessage(
          "Email Anda belum dikonfirmasi. Silakan periksa email terlebih dahulu.",
        );

        return;
      }

      setErrorMessage(
        rawMessage ||
          "Terjadi kesalahan saat masuk. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleLogin}
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

      {/* EMAIL */}
      <div>
        <label
          htmlFor="login-email"
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
            id="login-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
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

      {/* PASSWORD */}
      <div>
        <div
          className="
            mb-2
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <label
            htmlFor="login-password"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Kata sandi
          </label>

          <Link
            href="/forgot-password"
            className="
              text-sm
              font-semibold
              text-primary-600
              transition
              hover:text-primary-500
            "
          >
            Lupa kata sandi?
          </Link>
        </div>

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
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
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
              setShowPassword((current) => !current)
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
              disabled:cursor-not-allowed
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
      </div>

      {/* LOGIN */}
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
            className="h-5 w-5 animate-spin"
            aria-hidden="true"
          />
        )}

        {loading
          ? "Memproses..."
          : "Masuk ke HelpMe"}
      </button>
    </form>
  );
}