import Link from "next/link";

import AuthShell from "@/features/auth/components/AuthShell";

import GoogleAuthButton from "@/features/auth/components/GoogleAuthButton";

import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Selamat datang kembali"
      description="Masuk untuk mencari bantuan, menjadi Helper, dan melanjutkan aktivitas Anda di HelpMe."
    >
      <LoginForm />

      <div
        className="
          my-7
          flex
          items-center
          gap-4
        "
      >
        <div className="h-px flex-1 bg-slate-200" />

        <span
          className="
            text-xs
            font-medium
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
        >
          atau
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleAuthButton label="Masuk dengan Google" />

      <p
        className="
          mt-7
          text-center
          text-sm
          leading-6
          text-slate-500
        "
      >
        Belum punya akun?

        <Link
          href="/register"
          className="
            ml-1
            font-bold
            text-primary-600
            transition
            hover:text-primary-500
          "
        >
          Daftar sekarang
        </Link>
      </p>
    </AuthShell>
  );
}