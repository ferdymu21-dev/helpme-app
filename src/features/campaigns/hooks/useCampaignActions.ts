"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

import {
    publishCampaignAction,
    cancelCampaignAction,
} from "../actions";

export function useCampaignActions(campaignId: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function publish() {
    setLoading(true);

    try {
      await publishCampaignAction(campaignId);

      alert("Campaign berhasil dipublish.");

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    setLoading(true);

    try {
      await cancelCampaignAction(campaignId);
      
      alert("Campaign berhasil dibatalkan.");

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,

    publish,

    cancel,
  };
}