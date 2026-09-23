"use client";

const STORAGE_PREFIX =
  "helpme:midtrans-transaction:";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readNonEmptyString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim();

  return normalized
    ? normalized
    : null;
}

function buildStorageKey(
  orderId: string,
) {
  return `${STORAGE_PREFIX}${orderId}`;
}

export function rememberMidtransTransactionLookup(
  result: unknown,
): void {
  if (
    typeof window === "undefined" ||
    !isRecord(result)
  ) {
    return;
  }

  const orderId =
    readNonEmptyString(
      Reflect.get(
        result,
        "order_id",
      ),
    );

  const transactionId =
    readNonEmptyString(
      Reflect.get(
        result,
        "transaction_id",
      ),
    );

  if (
    !orderId ||
    !transactionId
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      buildStorageKey(orderId),
      transactionId,
    );
  } catch {
    /*
     * Lookup hint bersifat best-effort.
     * Kegagalan browser storage tidak
     * boleh menggagalkan payment flow.
     */
  }
}

export function getMidtransTransactionLookup(
  orderId: string,
): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const normalizedOrderId =
    orderId.trim();

  if (!normalizedOrderId) {
    return null;
  }

  try {
    return readNonEmptyString(
      window.sessionStorage.getItem(
        buildStorageKey(
          normalizedOrderId,
        ),
      ),
    );
  } catch {
    return null;
  }
}

export function clearMidtransTransactionLookup(
  orderId: string,
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const normalizedOrderId =
    orderId.trim();

  if (!normalizedOrderId) {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      buildStorageKey(
        normalizedOrderId,
      ),
    );
  } catch {
    /*
     * Tidak ada lifecycle payment
     * yang boleh gagal hanya karena
     * cleanup browser storage gagal.
     */
  }
}