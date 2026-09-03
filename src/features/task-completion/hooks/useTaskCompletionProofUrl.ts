"use client";

import { useEffect, useState } from "react";

import { createTaskCompletionProofSignedUrl } from "@/lib/supabase/storage/publicUrl";

export function useTaskCompletionProofUrl(
  path?: string | null,
) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(path));

  useEffect(() => {
    let cancelled = false;

    async function loadSignedUrl() {
      if (!path) {
        if (!cancelled) {
          setUrl("");
          setLoading(false);
        }

        return;
      }

      try {
        const signedUrl =
          await createTaskCompletionProofSignedUrl(path);

        if (!cancelled) {
          setUrl(signedUrl);
        }
      } catch (error) {
        console.error(
          "Gagal membuat signed URL completion proof:",
          error,
        );

        if (!cancelled) {
          setUrl("");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return {
    url,
    loading,
  };
}