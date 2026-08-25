"use client";

import {
  useState,
} from "react";

import {
  LoaderCircle,
} from "lucide-react";

import {
  FcGoogle,
} from "react-icons/fc";

import {
  signInWithGoogle,
} from "../services/auth.service";

interface GoogleAuthButtonProps {
  label: string;
}

export default function GoogleAuthButton({
  label,
}: GoogleAuthButtonProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleGoogleAuth() {
    if (loading) return;

    setErrorMessage("");

    try {
      setLoading(true);

      await signInWithGoogle();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      console.error(error);

      setErrorMessage(
        message ||
          "Tidak dapat melanjutkan dengan Google. Silakan coba kembali.",
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-5
          py-3.5
          text-sm
          font-bold
          text-slate-700
          shadow-sm
          transition
          hover:border-slate-300
          hover:bg-slate-50
          focus:outline-none
          focus:ring-4
          focus:ring-primary-100
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:text-base
        "
      >
        {loading ? (
          <LoaderCircle
            className="
              h-5
              w-5
              animate-spin
            "
            aria-hidden="true"
          />
        ) : (
          <FcGoogle
            className="h-5 w-5"
            aria-hidden="true"
          />
        )}

        {loading
          ? "Menghubungkan..."
          : label}
      </button>

      {errorMessage && (
        <p
          role="alert"
          className="
            mt-3
            text-center
            text-sm
            leading-6
            text-red-600
          "
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}