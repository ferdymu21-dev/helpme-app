"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase
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
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("GET CURRENT USER ERROR:", error);

        setUser(null);
        return;
      }

      setUser({
        id: data.id,
        fullName: data.full_name ?? "",
        username: data.username ?? "",
        avatarUrl: data.avatar_url ?? "",
        bio: data.bio ?? "",
        location: data.location ?? "",
        verificationStatus: data.verification_status ?? "",
      });
    } catch (error) {
      console.error("REFRESH CURRENT USER ERROR:", error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial profile fetch is intentionally triggered from an effect.
    // The refresh function updates local React state with data from Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  return {
    user,
    loading,
    refresh,
  };
}