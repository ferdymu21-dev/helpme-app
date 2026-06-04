"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuthStore,
} from "@/store/auth.store";

export default function PublicOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuthStore();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [
    user,
    loading,
    router,
  ]);

  if (loading) {
    return (
      <div
        className="
          flex min-h-screen
          items-center
          justify-center
        "
      >
        Loading...
      </div>
    );
  }

  return children;
}