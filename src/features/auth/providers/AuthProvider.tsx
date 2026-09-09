"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import type { User } from "@supabase/supabase-js";

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

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setRole, setLoading } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    let authSyncTimer: number | null = null;

    async function getUserData() {
      const { data, error } = await supabase
        .rpc("get_current_user_access_state")
        .maybeSingle<CurrentUserAccessState>();

      if (error) {
        console.error("AUTH ACCESS STATE ERROR:", error);

        return null;
      }

      return data;
    }

    async function syncAuthenticatedUser(user: User) {
      const userData = await getUserData();

      if (!isMounted) {
        return;
      }

      if (userData?.is_banned) {
        await supabase.auth.signOut();

        if (!isMounted) {
          return;
        }

        setUser(null);

        setRole(null);

        alert("Akun Anda telah diblokir oleh admin.");

        router.replace("/login");

        return;
      }

      setUser(user);

      setRole(userData?.role ?? null);
    }

    async function loadUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) {
          return;
        }

        if (error) {
          /*
           * Tidak adanya session adalah state
           * normal untuk browser yang belum login,
           * sudah logout, atau session-nya telah
           * berakhir.
           *
           * Supabase getUser() mengembalikan
           * AuthSessionMissingError pada kondisi
           * tersebut. Jangan laporkan sebagai
           * runtime error ke console.
           */
          if (error.name !== "AuthSessionMissingError") {
            console.error("AUTH INITIAL USER ERROR:", error);
          }

          setUser(null);

          setRole(null);

          return;
        }

        if (!user) {
          setUser(null);

          setRole(null);

          return;
        }

        await syncAuthenticatedUser(user);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("AUTH INITIALIZATION ERROR:", error);

        setUser(null);

        setRole(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    /*
     * IMPORTANT:
     *
     * Callback onAuthStateChange harus
     * tetap sinkron.
     *
     * Jangan await RPC / auth method /
     * query Supabase langsung di sini.
     */
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) {
          return;
        }

        /*
         * Initial state sudah ditangani
         * loadUser().
         *
         * Mengabaikan INITIAL_SESSION
         * juga mencegah initial request
         * dijalankan dua kali.
         */
        if (event === "INITIAL_SESSION") {
          return;
        }

        if (authSyncTimer !== null) {
          window.clearTimeout(authSyncTimer);

          authSyncTimer = null;
        }

        if (!session?.user) {
          setUser(null);

          setRole(null);

          setLoading(false);

          return;
        }

        const authUser = session.user;

        /*
         * State user boleh disinkronkan
         * langsung karena ini bukan
         * Supabase API call.
         */
        setUser(authUser);

        /*
         * Supabase API call dijadwalkan
         * setelah auth callback selesai
         * agar tidak menahan auth lock.
         */
        authSyncTimer = window.setTimeout(() => {
          authSyncTimer = null;

          void syncAuthenticatedUser(authUser)
            .catch((error) => {
              if (!isMounted) {
                return;
              }

              console.error("AUTH STATE SYNC ERROR:", error);
            })
            .finally(() => {
              if (isMounted) {
                setLoading(false);
              }
            });
        }, 0);
      },
    );

    return () => {
      isMounted = false;

      if (authSyncTimer !== null) {
        window.clearTimeout(authSyncTimer);
      }

      listener.subscription.unsubscribe();
    };
  }, [router, setLoading, setRole, setUser]);

  return children;
}