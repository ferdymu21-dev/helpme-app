"use client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

export default function DesktopGreetingSection() {
  const {
    user,
    loading,
  } = useCurrentUser();

  const firstName =
    user?.fullName
      ?.trim()
      .split(/\s+/)[0] ||
    "User";

  return (
    <section className="min-w-0">
      <div>
        <p
          className="
            text-xs
            font-bold
            tracking-wide
            text-indigo-600
          "
        >
          BERANDA
        </p>

        <h1
          className="
            mt-1
            truncate
            text-xl
            font-black
            tracking-tight
            text-slate-950
          "
        >
          Halo,{" "}
          {loading
            ? "..."
            : firstName} 👋
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Ada yang bisa HelpMe bantu
          hari ini?
        </p>
      </div>
    </section>
  );
}