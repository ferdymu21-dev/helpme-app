"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

interface CurrentUserAccessState {
  role: string | null;
  is_admin: boolean | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  suspended_until: string | null;
  suspension_reason: string | null;
}

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
          .rpc("get_current_user_access_state")
          .maybeSingle<CurrentUserAccessState>();

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