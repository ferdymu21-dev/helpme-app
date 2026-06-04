"use client";

import {
  useEffect,
} from "react";

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
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      setLoading(false);
    }

    loadUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);

          setLoading(false);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return children;
}