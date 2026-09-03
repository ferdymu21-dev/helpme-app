import { supabase } from "@/lib/supabase/client";

const TASK_COMPLETION_PROOF_SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function createTaskCompletionProofSignedUrl(
  path?: string | null,
): Promise<string> {
  if (!path) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from("task-completion-proofs")
    .createSignedUrl(
      path,
      TASK_COMPLETION_PROOF_SIGNED_URL_TTL_SECONDS,
    );

  if (error) {
    throw error;
  }

  return data.signedUrl;
}