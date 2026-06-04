import PublicLayout from "@/components/layout/PublicLayout";

import BrandLogo from "@/components/branding/BrandLogo";

import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <PublicLayout>
      <div
        className="
          w-full
          rounded-3xl
          bg-white
          p-8
          shadow-sm
        "
      >
        {/* BRAND */}
        <div className="mb-1 flex justify-center">
          <BrandLogo />
        </div>

        {/* TITLE */}
        <div className="mb-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Selamat datang kembali
          </h2>

          <p className="mt-2 text-slate-500">
            Masuk untuk melanjutkan ke HelpMe
          </p>
        </div>

        {/* FORM */}
        <LoginForm />

        {/* FOOTER */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Belum punya akun?
          <a
            href="/register"
            className="
              ml-1
              font-medium
              text-indigo-600
            "
          >
            Register
          </a>
        </p>
      </div>
    </PublicLayout>
  );
}