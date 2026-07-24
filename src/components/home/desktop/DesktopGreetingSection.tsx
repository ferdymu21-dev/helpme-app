"use client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

export default function DesktopGreetingSection() {

  const {
    user,
    loading,
  } = useCurrentUser();

  return (

    <section>

      <div>

        {/* TITLE */}
        <h1
          className="
            text-xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Halo, {loading ? "..." : user?.fullName || "User"}! 👋
        </h1>

        {/* SUBTITLE */}
        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Ada yang perlu dibantu hari ini?
        </p>

      </div>

    </section>

  );
}