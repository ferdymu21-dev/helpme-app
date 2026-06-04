"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

interface Profile {
  full_name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        setProfile({
          full_name:
            user.user_metadata?.full_name ||
            "User",

          email:
            user.email || "",
        });

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Memuat profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-2xl">

        {/* CARD */}
        <div
          className="
            rounded-4xl
            bg-white
            p-8
            shadow-[0_10px_40px_rgba(15,23,42,0.06)]
          "
        >

          {/* AVATAR */}
          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-indigo-100
              text-3xl
              font-bold
              text-indigo-700
            "
          >
            {profile?.full_name?.charAt(0)}
          </div>

          {/* INFO */}
          <div className="mt-6">

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              {profile?.full_name}
            </h1>

            <p className="mt-2 text-slate-500">
              {profile?.email}
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}