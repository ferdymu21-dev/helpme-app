import { supabase } from "@/lib/supabase/client";

export async function ensureServiceRequestConversationRepository(
  requestId: string,
): Promise<unknown> {
  const { data, error } = await supabase.rpc(
    "ensure_service_request_conversation",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function sendServiceRequestMessageRepository(
  conversationId: string,
  content: string,
): Promise<unknown> {
  const { data, error } = await supabase.rpc("send_service_request_message", {
    p_conversation_id: conversationId,
    p_content: content,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function markServiceRequestConversationReadRepository(
  conversationId: string,
): Promise<unknown> {
  const { data, error } = await supabase.rpc(
    "mark_service_request_conversation_read",
    {
      p_conversation_id: conversationId,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}
