"use client";

import { useState } from "react";

import { login } from "../services/auth.service";

export default function LoginForm() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await login({
        email,
        password,
      });

      window.location.href = "/home";
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* EMAIL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          type="email"
          placeholder="Masukkan email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
            outline-none
            transition
            focus:border-indigo-500
            focus:bg-white
          "
        />
      </div>

      {/* PASSWORD */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>

        <input
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
            outline-none
            transition
            focus:border-indigo-500
            focus:bg-white
          "
        />
      </div>

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-2xl
          bg-indigo-600
          p-4
          font-medium
          text-white
          transition
          hover:opacity-90
          disabled:opacity-50
        "
      >
        {loading ? "Loading..." : "Login"}
      </button>

      <div className="mt-4 text-center">
        <a
          href="/forgot-password"
          className="
            text-sm
            text-blue-600
            hover:underline
        "
        >
          Lupa Kata Sandi?
        </a>
      </div>
    </form>
  );
}