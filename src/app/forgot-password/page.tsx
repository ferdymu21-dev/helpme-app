"use client";

import {
  FormEvent,
  useState,
} from "react";

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

  async function handleReset(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const redirectTo =
        `${window.location.origin}/reset-password`;

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          },
        );

      if (error) {
        alert(error.message);

        return;
      }

      alert(
        "Link reset password telah dikirim ke email Anda.",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Gagal mengirim email reset.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-100
      "
    >
      <form
        onSubmit={handleReset}
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-8
          shadow-lg
        "
      >
        <h1
          className="
            text-center
            text-3xl
            font-black
          "
        >
          Lupa Kata Sandi
        </h1>

        <p
          className="
            mt-2
            text-center
            text-slate-500
          "
        >
          Masukkan email akun Anda
        </p>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value,
            )
          }
          placeholder="Email"
          autoComplete="email"
          required
          className="
            mt-6
            w-full
            rounded-xl
            border
            p-3
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            mt-6
            w-full
            rounded-xl
            bg-slate-900
            py-3
            font-semibold
            text-white
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading
            ? "Mengirim..."
            : "Kirim Link Reset"}
        </button>
      </form>
    </main>
  );
}