"use client";

import { useEffect, useState } from "react";
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

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {

    try {

      setLoading(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {

        setUser(null);

        return;
      }

      const {
        data,
        error,
      } = await supabase

        .from("users")

        .select(`
          id,
          full_name,
          username,
          avatar_url,
          bio,
          location,
          verification_status
        `)

        .eq("id", authUser.id)

        .single();

      if (error) {

        console.error(error);

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

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    refresh();

  }, []);

  return {

    user,

    loading,

    refresh,

  };

}