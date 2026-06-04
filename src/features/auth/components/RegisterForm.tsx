"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { register } from "../services/auth.service";

export default function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await register({
        full_name: fullName,
        email,
        password,
      });

      alert("Register berhasil");

      window.location.href = "/login";
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-4"
    >
      <input
        type="text"
        placeholder="Nama Lengkap"
        value={fullName}
        onChange={(e) =>
          setFullName(e.target.value)
        }
        className="
          w-full rounded-xl border
          p-3 outline-none
          focus:border-slate-900
        "
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        className="
          w-full rounded-xl border
          p-3 outline-none
          focus:border-slate-900
        "
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className="
          w-full rounded-xl border
          p-3 outline-none
          focus:border-slate-900
        "
      />

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl
          bg-slate-900 p-3
          text-white
          transition
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Loading..."
          : "Register"}
      </button>
    </form>
  );
}