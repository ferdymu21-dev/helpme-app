"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setRole, setLoading } = useAuthStore();

  const router = useRouter();

  async function getUserData(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
          role,
          is_banned
        `,
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error(error);

      return null;
    }

    return data;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (user) {
        const userData = await getUserData(user.id);

        if (!isMounted) return;

        if (userData?.is_banned) {
          await supabase.auth.signOut();

          if (!isMounted) return;

          setUser(null);
          setRole(null);
          setLoading(false);

          alert("Akun Anda telah diblokir.");

          router.push("/login");

          return;
        }

        setRole(userData?.role ?? null);
      } else {
        setRole(null);
      }

      setUser(user);

      setLoading(false);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const userData = await getUserData(session.user.id);

          if (!isMounted) return;

          if (userData?.is_banned) {
            await supabase.auth.signOut();

            if (!isMounted) return;

            setUser(null);
            setRole(null);
            setLoading(false);

            alert("Akun Anda telah diblokir oleh admin.");

            router.push("/login");

            return;
          }

          setRole(userData?.role ?? null);
        } else {
          setRole(null);
        }

        setUser(session?.user ?? null);

        setLoading(false);
      },
    );

    return () => {
      isMounted = false;

      listener.subscription.unsubscribe();
    };
  }, [router, setLoading, setRole, setUser]);

  return children;
}