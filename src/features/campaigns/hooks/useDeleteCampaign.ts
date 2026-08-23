"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { deleteCampaignAction } from "../actions";

export function useDeleteCampaign(campaignId: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function remove() {
    const confirmed = window.confirm("Yakin ingin menghapus campaign ini?");

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      await deleteCampaignAction(campaignId);

      router.push("/admin/campaigns");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,

    remove,
  };
}