"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

export default function MobileGreetingSection() {

  const [name, setName] =
    useState("User");

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const fullName =
          user.user_metadata?.full_name;

        if (fullName) {
          setName(fullName);
        }

      } catch (error) {
        console.error(error);
      }
    }

    loadUser();
  }, []);

  return (
    <section className="px-6 pt-4">

      <div>

        {/* TITLE */}
        <h1
          className="
            text-base
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Halo, {name}! 👋
        </h1>

        {/* SUBTITLE */}
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