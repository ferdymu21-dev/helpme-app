export function localDateTimeToIso(
  value: string,
): string {
  const trimmedValue =
    value.trim();

  if (!trimmedValue) {
    throw new Error(
      "Tanggal dan waktu wajib diisi.",
    );
  }

  /*
   * datetime-local tidak membawa
   * timezone.
   *
   * new Date(value) di browser akan
   * menginterpretasikan value sebagai
   * waktu lokal browser, kemudian
   * toISOString() mengubahnya ke UTC.
   */
  const date =
    new Date(trimmedValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      "Tanggal dan waktu tidak valid.",
    );
  }

  return date.toISOString();
}

export function isoToLocalDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const pad = (
    number: number,
  ) =>
    String(number).padStart(
      2,
      "0",
    );

  return [
    date.getFullYear(),
    "-",
    pad(
      date.getMonth() + 1,
    ),
    "-",
    pad(
      date.getDate(),
    ),
    "T",
    pad(
      date.getHours(),
    ),
    ":",
    pad(
      date.getMinutes(),
    ),
  ].join("");
}

export function isAbsoluteDateTime(
  value: string,
): boolean {
  const trimmedValue =
    value.trim();

  /*
   * Server hanya menerima timestamp
   * yang sudah mempunyai timezone:
   *
   * ...Z
   * atau
   * ...+07:00
   * atau
   * ...-05:00
   *
   * datetime-local mentah tidak boleh
   * lolos sampai database.
   */
  const hasTimezone =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(
      trimmedValue,
    );

  if (!hasTimezone) {
    return false;
  }

  const date =
    new Date(trimmedValue);

  return !Number.isNaN(
    date.getTime(),
  );
}