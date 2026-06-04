import PublicLayout from "@/components/layout/PublicLayout";

import BrandLogo from "@/components/branding/BrandLogo";

import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
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
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>

        {/* TITLE */}
        <div className="mb-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Bergabung dengan HelpMe
          </h2>
          <p className="mt-3 text-slate-500">
            Mulai cari bantuan atau dapatkan penghasilan tambahan.
          </p>
        </div>

        {/* FORM */}
        <RegisterForm />

        {/* FOOTER */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Sudah punya akun?
          <a
            href="/login"
            className="
              ml-1
              font-medium
              text-indigo-600
            "
          >
            Login
          </a>
        </p>
      </div>
    </div>
    </PublicLayout>
  );
}