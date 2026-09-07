"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

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

  const authUserId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  const authLoading = useAuthStore(
    (state) => state.loading,
  );

  useEffect(() => {
    if (
      authLoading ||
      !authUserId
    ) {
      return;
    }

    let cancelled = false;

    async function checkBan() {
      try {
        /*
         * AuthProvider sudah menjadi
         * source of truth untuk session.
         *
         * ModerationGuard hanya perlu
         * memeriksa moderation state.
         */
        const {
          data,
          error,
        } = await supabase
          .rpc(
            "get_current_user_access_state",
          )
          .maybeSingle<CurrentUserAccessState>();

        if (
          cancelled ||
          error ||
          !data
        ) {
          return;
        }

        if (data.is_banned) {
          await supabase.auth.signOut();

          if (cancelled) {
            return;
          }

          alert(
            "Akun Anda telah diblokir permanen.",
          );

          router.replace("/login");
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    }

    void checkBan();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    authUserId,
    router,
  ]);

  return null;
}