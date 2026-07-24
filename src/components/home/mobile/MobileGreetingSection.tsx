"use client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

export default function MobileGreetingSection() {

  const {
    user,
    loading,

  } = useCurrentUser();

  return (

    <section className="px-6 pt-4">

      <div>

        <h1
          className="
            text-[14px]
            font-bold
            tracking-tight
            text-slate-900
          "
        >

          Halo, {loading ? "..." : user?.fullName || "User"}! 👋

        </h1>

        <p
          className="
            mt-1
            text-xs
            text-slate-500
          "
        >
          Ada yang perlu dibantu hari ini?
        </p>

      </div>

    </section>

  );
}