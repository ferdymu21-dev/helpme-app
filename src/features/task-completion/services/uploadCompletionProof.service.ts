import { supabase } from "@/lib/supabase/client";

export async function uploadCompletionProof(
  file: File,
  taskId: string,
) {
  const ext = file.name.split(".").pop();

  const path =
    `${taskId}/${crypto.randomUUID()}.${ext}`;

  const { error } =
    await supabase.storage
      .from("task-completion-proofs")
      .upload(path, file);

  if (error) throw error;

  const { data } =
    supabase.storage
      .from("task-completion-proofs")
      .getPublicUrl(path);

  return data.publicUrl;
}