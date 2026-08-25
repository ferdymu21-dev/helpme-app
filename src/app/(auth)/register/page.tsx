import Link from "next/link";

import AuthShell from "@/features/auth/components/AuthShell";

import GoogleAuthButton from "@/features/auth/components/GoogleAuthButton";

import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Bergabung dengan HelpMe"
      description="Buat akun untuk mencari bantuan atau mendapatkan penghasilan tambahan dengan menjadi Helper."
    >
      <RegisterForm />

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

      <GoogleAuthButton label="Daftar dengan Google" />

      <p
        className="
          mt-7
          text-center
          text-sm
          leading-6
          text-slate-500
        "
      >
        Sudah punya akun?

        <Link
          href="/login"
          className="
            ml-1
            font-bold
            text-primary-600
            transition
            hover:text-primary-500
          "
        >
          Masuk sekarang
        </Link>
      </p>
    </AuthShell>
  );
}