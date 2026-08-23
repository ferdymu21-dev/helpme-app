const ONE_DAY_IN_MS =
  24 * 60 * 60 * 1000;

export function formatMessageTime(
  timestamp: string | null | undefined,
  nowTimestamp: number,
) {
  if (!timestamp) {
    return "";
  }

  const messageDate =
    new Date(timestamp);

  const messageTimestamp =
    messageDate.getTime();

  if (
    Number.isNaN(messageTimestamp)
  ) {
    return "";
  }

  const age =
    Math.max(
      0,
      nowTimestamp -
        messageTimestamp,
    );

  /*
   * Belum 24 jam:
   * tampilkan jam.
   */
  if (age < ONE_DAY_IN_MS) {
    return messageDate.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );
  }

  const now =
    new Date(nowTimestamp);

  /*
   * Sudah 24 jam:
   * tampilkan tanggal.
   *
   * Jika masih tahun yang sama:
   * 22 Agu
   *
   * Jika beda tahun:
   * 22 Agu 2025
   */
  if (
    messageDate.getFullYear() ===
    now.getFullYear()
  ) {
    return messageDate.toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "short",
      },
    );
  }

  return messageDate.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

export function formatChatMessageTime(
  timestamp: string | null | undefined,
) {
  if (!timestamp) {
    return "";
  }

  const messageDate =
    new Date(timestamp);

  if (
    Number.isNaN(
      messageDate.getTime(),
    )
  ) {
    return "";
  }

  return messageDate.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );
}