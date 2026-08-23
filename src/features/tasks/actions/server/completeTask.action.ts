"use server";

import { adminSupabase } from "@/lib/supabase/admin";

export async function completeTaskAction(
  taskId: string,
  proofPhoto: string,
) {
  const { error } = await adminSupabase
    .from("tasks")
    .update({
      status: "WAITING_CONFIRMATION",
      completion_proof_photo: proofPhoto,
    })
    .eq("id", taskId);

  if (error) {
    throw error;
  }

  return true;
}