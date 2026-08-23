"use server";

import { markNotificationReadServer } from "../../server/markNotificationRead.server";

import { recordCampaignOpened } from "@/features/campaigns/repositories";

export async function markNotificationReadAction(
  notificationId: string,
) {
  // Tandai notifikasi sebagai sudah dibaca
  await markNotificationReadServer(notificationId);

  // Catat analytics OPENED (anti double-open)
  await recordCampaignOpened(notificationId);
}