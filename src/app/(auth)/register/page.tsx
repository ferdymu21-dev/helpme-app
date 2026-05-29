import RegisterForm from
"@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold">
            Register
          </h1>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}