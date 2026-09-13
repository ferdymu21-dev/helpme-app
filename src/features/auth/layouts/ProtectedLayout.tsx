"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

import { getSafeAuthRedirect } from "../utils/safe-auth-redirect";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      const nextPath = getSafeAuthRedirect(
        `${pathname}${window.location.search}`,
      );

      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [user, loading, pathname, router]);

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

  if (!user) {
    return null;
  }

  return children;
}
