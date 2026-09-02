import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignEvent } from "@/features/campaigns/constants/campaign-event";

import { recordCampaignEngagementEventRepository } from "@/features/campaigns/repositories";

export async function markNotificationReadServer(
  notificationId: string,
  userId: string,
) {
  /*
   * Service Role bypass RLS.
   *
   * Ownership wajib menjadi bagian query.
   */
  const { data: notification, error } = await adminSupabase
    .from("notifications")
    .select(
      `
        id,
        user_id,
        is_read,
        campaign_id
      `,
    )
    .eq("id", notificationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!notification) {
    throw new Error("Notification tidak ditemukan.");
  }

  /*
   * RPC bersifat idempotent.
   *
   * Kita boleh memanggil OPENED kembali walaupun
   * notification sudah read. Jika event sudah ada,
   * event tidak dibuat dua kali dan statistik hanya
   * direconcile dari canonical events.
   *
   * Ini juga memperbaiki kasus partial failure lama:
   * notification sudah read tetapi OPENED belum tercatat.
   */
  if (notification.campaign_id) {
    await recordCampaignEngagementEventRepository({
      notificationId: notification.id,
      userId: notification.user_id,
      eventType: CampaignEvent.OPENED,
    });
  }

  if (!notification.is_read) {
    const { error: updateError } = await adminSupabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .eq("is_read", false);

    if (updateError) {
      throw updateError;
    }
  }

  return notification;
}