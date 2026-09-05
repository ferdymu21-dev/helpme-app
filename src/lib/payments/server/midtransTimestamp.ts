import "server-only";

const MIDTRANS_WIB_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function normalizeMidtransTimestamp(
  value: string | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !MIDTRANS_WIB_TIMESTAMP_PATTERN.test(
      value,
    )
  ) {
    throw new Error(
      "Format timestamp Midtrans tidak valid.",
    );
  }

  /*
   * Midtrans mengembalikan timestamp
   * transaction/settlement/expiry dalam
   * waktu WIB (GMT+7), tetapi string
   * tersebut tidak membawa timezone.
   *
   * Tambahkan offset +07:00 secara
   * eksplisit sebelum dikonversi ke UTC.
   */
  const timestamp = Date.parse(
    `${value.replace(" ", "T")}+07:00`,
  );

  if (!Number.isFinite(timestamp)) {
    throw new Error(
      "Timestamp Midtrans tidak dapat diparse.",
    );
  }

  return new Date(
    timestamp,
  ).toISOString();
}