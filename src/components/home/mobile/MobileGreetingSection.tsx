"use client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

export default function MobileGreetingSection() {
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
    <section
      className="px-5 pt-2">
      <h1
        className="
          mt-1
          text-[13px]
          font-semibold
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
          mt-0.5
          text-[12px]
          leading-5
          text-slate-500
        "
      >
        Ada yang bisa HelpMe bantu
        hari ini?
      </p>
    </section>
  );
}