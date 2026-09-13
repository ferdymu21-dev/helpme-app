import {
  ensureServiceRequestConversationRepository,
  markServiceRequestConversationReadRepository,
  sendServiceRequestMessageRepository,
} from "../repositories/service-request-chat.repository";

import {
  validateServiceRequestChatIdentity,
  validateServiceRequestChatMessage,
} from "../validators/validate-service-request-chat";

function parseRpcIdentity(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} tidak valid.`);
  }

  return validateServiceRequestChatIdentity(value, label);
}

export async function ensureServiceRequestConversationService(
  requestId: string,
): Promise<string> {
  const normalizedRequestId = validateServiceRequestChatIdentity(
    requestId,
    "Permintaan Jasa",
  );

  const result =
    await ensureServiceRequestConversationRepository(normalizedRequestId);

  return parseRpcIdentity(result, "Percakapan");
}

export async function sendServiceRequestMessageService(
  conversationId: string,
  content: string,
): Promise<string> {
  const normalizedConversationId = validateServiceRequestChatIdentity(
    conversationId,
    "Percakapan",
  );

  const normalizedContent = validateServiceRequestChatMessage(content);

  const result = await sendServiceRequestMessageRepository(
    normalizedConversationId,
    normalizedContent,
  );

  return parseRpcIdentity(result, "Pesan");
}

export async function markServiceRequestConversationReadService(
  conversationId: string,
): Promise<string> {
  const normalizedConversationId = validateServiceRequestChatIdentity(
    conversationId,
    "Percakapan",
  );

  const result = await markServiceRequestConversationReadRepository(
    normalizedConversationId,
  );

  return parseRpcIdentity(result, "Percakapan");
}
