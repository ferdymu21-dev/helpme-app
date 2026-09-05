import "server-only";

function parseMidtransAmount(
  value: string,
): number | null {
  if (
    !/^\d+(?:\.0{1,2})?$/.test(
      value,
    )
  ) {
    return null;
  }

  const amount = Number(value);

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    return null;
  }

  return amount;
}

export function assertPaymentAmountMatches(
  localAmount: unknown,
  midtransAmount: string,
) {
  if (
    typeof localAmount !== "number" ||
    !Number.isSafeInteger(localAmount) ||
    localAmount <= 0
  ) {
    throw new Error(
      "Nominal payment HelpMe tidak valid.",
    );
  }

  const providerAmount =
    parseMidtransAmount(
      midtransAmount,
    );

  if (providerAmount === null) {
    throw new Error(
      "Nominal Midtrans tidak valid.",
    );
  }

  if (providerAmount !== localAmount) {
    throw new Error(
      "Nominal pembayaran Midtrans tidak sesuai.",
    );
  }
}