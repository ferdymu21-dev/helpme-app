"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  useAuthStore,
} from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    setUser,
    setRole,
    setLoading,
  } = useAuthStore();

  const router =
    useRouter();

  async function getUserData(
    userId: string
  ) {

    const {
      data,
      error,
    } = await supabase
      .from("users")
      .select(`
      role,
      is_banned
    `)
      .eq("id", userId)
      .single();

    if (error) {

      console.error(error);

      return null;

    }

    return data;

  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {

        const userData =
          await getUserData(
            user.id
          );

        if (userData?.is_banned) {

          await supabase.auth.signOut();

          setLoading(false);

          alert(
            "Akun Anda telah diblokir."
          );

          router.push("/login");

          return;

        }

        setRole(
          userData?.role ?? null
        );

      }

      setUser(user);

      setLoading(false);
    }

    loadUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {

          if (session?.user) {

            const userData =
              await getUserData(
                session.user.id
              );

            if (userData?.is_banned) {

              await supabase.auth.signOut();

              alert(
                "Akun Anda telah diblokir oleh admin."
              );

              router.push("/login");

              return;

            }

            setRole(
              userData?.role ?? null
            );

          }

          setUser(
            session?.user ?? null
          );

          if (!session?.user) {

            setRole(null);

          }

          setLoading(false);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return children;
}