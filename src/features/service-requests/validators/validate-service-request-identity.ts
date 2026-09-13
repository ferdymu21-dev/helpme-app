const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateServiceRequestId(value: string): string {
  const requestId = value.trim();

  if (!UUID_PATTERN.test(requestId)) {
    throw new Error("Identitas Permintaan Jasa tidak valid.");
  }

  return requestId;
}
