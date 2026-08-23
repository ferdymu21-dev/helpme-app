"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function ModerationGuard() {
  const router = useRouter();

  useEffect(() => {
    async function checkBan() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select(
            `
              is_banned
            `,
          )
          .eq("id", user.id)
          .single();

        if (error || !data) {
          return;
        }

        if (data.is_banned) {
          await supabase.auth.signOut();

          alert("Akun Anda telah diblokir permanen.");

          router.replace("/login");
        }
      } catch (error) {
        console.error(error);
      }
    }

    checkBan();
  }, [router]);

  return null;
}