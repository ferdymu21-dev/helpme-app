const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateServiceRequestChatIdentity(
  value: string,
  label: string,
): string {
  const normalized = value.trim();

  if (!UUID_PATTERN.test(normalized)) {
    throw new Error(`${label} tidak valid.`);
  }

  return normalized;
}

export function validateServiceRequestChatMessage(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Pesan tidak boleh kosong.");
  }

  return normalized;
}
