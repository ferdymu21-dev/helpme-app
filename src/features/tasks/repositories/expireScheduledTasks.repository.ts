import { adminSupabase } from "@/lib/supabase/admin";

export async function expireScheduledTasksRepository() {
  const now = new Date().toISOString();

  const {
    data,
    error,
  } = await adminSupabase
    .from("tasks")
    .update({
      status: "EXPIRED",
    })
    .eq("status", "OPEN")
    .lte("scheduled_at", now)
    .select("id");

  if (error) {
    throw error;
  }

  return data ?? [];
}