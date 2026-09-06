"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

export interface CurrentUser {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  location: string;
  verificationStatus: string;
}

export function useCurrentUser() {
  const authUserId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  const authLoading = useAuthStore(
    (state) => state.loading,
  );

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(async () => {
    /*
     * AuthProvider adalah source of truth
     * untuk session/authenticated user.
     *
     * Jangan memanggil auth.getUser()
     * kembali dari setiap consumer.
     */
    if (authLoading) {
      setLoading(true);

      return;
    }

    if (!authUserId) {
      setUser(null);

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("users")
        .select(
          `
            id,
            full_name,
            username,
            avatar_url,
            bio,
            location,
            verification_status
          `,
        )
        .eq("id", authUserId)
        .single();

      if (error) {
        console.error(
          "GET CURRENT USER ERROR:",
          error,
        );

        setUser(null);

        return;
      }

      setUser({
        id: data.id,

        fullName:
          data.full_name ?? "",

        username:
          data.username ?? "",

        avatarUrl:
          data.avatar_url ?? "",

        bio:
          data.bio ?? "",

        location:
          data.location ?? "",

        verificationStatus:
          data.verification_status ?? "",
      });
    } catch (error) {
      console.error(
        "REFRESH CURRENT USER ERROR:",
        error,
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [
    authLoading,
    authUserId,
  ]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void refresh();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  return {
    user,
    loading,
    refresh,
  };
}