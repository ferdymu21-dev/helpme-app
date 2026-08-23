import { supabase } from "@/lib/supabase/client";

export function getTaskCompletionProofUrl(path?: string | null) {
  if (!path) return "";

  const { data } = supabase.storage
    .from("task-completion-proofs")
    .getPublicUrl(path);

  return data.publicUrl;
}