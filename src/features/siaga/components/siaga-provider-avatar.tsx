"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";

interface AvatarState {
  userId: string;
  url: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function SiagaProviderAvatar() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [avatarState, setAvatarState] = useState<AvatarState | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      return () => {
        cancelled = true;
      };
    }

    const currentUserId = userId;

    async function loadOrganizationAvatar() {
      let url = "";

      try {
        const { data, error } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!error && accessToken) {
          const response = await fetch(
            "/api/siaga/provider/organizations",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              cache: "no-store",
            },
          );

          if (response.ok) {
            const payload: unknown = await response.json();

            if (isRecord(payload) && Array.isArray(payload.items)) {
              // Endpoint mengurutkan organisasi terbaru terlebih dahulu.
              // Gunakan foto organisasi terbaru yang memiliki foto profil.
              const organizations = payload.items.filter(isRecord);

              url =
                organizations
                  .map((organization) =>
                    typeof organization.profileImageUrl === "string"
                      ? organization.profileImageUrl
                      : "",
                  )
                  .find((candidate) => candidate.length > 0) ?? "";
            }
          }
        }
      } catch {
        // Jika foto organisasi gagal dimuat, tampilkan ikon fallback.
        url = "";
      }

      if (!cancelled) {
        setAvatarState({
          userId: currentUserId,
          url,
        });
      }
    }

    void loadOrganizationAvatar();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const avatarUrl =
    userId && avatarState?.userId === userId
      ? avatarState.url
      : "";

  return (
    <Link
      href="/siaga/provider/profile"
      aria-label="Buka profil penyedia HelpMe Siaga"
      title="Dashboard Organisasi Siaga"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:scale-95"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Logo organisasi penyedia Siaga"
          width={40}
          height={40}
          unoptimized
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <UserRound
          className="h-5 w-5 text-slate-600"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
