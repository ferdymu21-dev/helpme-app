"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const authUser = useAuthStore(
    (state) => state.user,
  );

  const authLoading = useAuthStore(
    (state) => state.loading,
  );

  const role = useAuthStore(
    (state) => state.role,
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authUser) {
      router.replace("/login");

      return;
    }

    /*
     * Setelah authLoading=false,
     * role seharusnya sudah resolved.
     *
     * role=null maupun role non-ADMIN
     * harus fail closed, bukan menunggu
     * "Memuat role..." tanpa akhir.
     */
    if (role !== "ADMIN") {
      router.replace("/");
    }
  }, [
    authLoading,
    authUser,
    role,
    router,
  ]);

  if (authLoading) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
        "
      >
        <p>Memuat sesi...</p>
      </main>
    );
  }

  if (
    !authUser ||
    role !== "ADMIN"
  ) {
    return null;
  }

  return children;
}