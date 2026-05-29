import LoginForm from
"@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="
        flex min-h-screen
        items-center justify-center
        bg-slate-100
        p-6
      "
    >
      <div
        className="
          w-full max-w-md
          rounded-3xl
          bg-white
          p-8
          shadow-sm
        "
      >
        <h1
          className="
            mb-6 text-3xl
            font-bold
            text-slate-900
          "
        >
          Login
        </h1>

        <LoginForm />
      </div>
    </main>
  );
}