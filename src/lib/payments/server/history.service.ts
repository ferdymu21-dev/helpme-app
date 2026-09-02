import {
  getDonationTransactions,
  getDonationTransactionById,
  getTaskTransactions,
  getTaskTransactionById,
} from "./history.repository";

import { mapPaymentDetail } from "./mappers/paymentDetail.mapper";

import { mapPaymentHistory } from "./mappers/payment.mapper";

export async function getTransactionHistory(
  userId: string,

  cursor?: string,

  limit: number = 10,
) {
  const [donations, taskPayments] = await Promise.all([
    getDonationTransactions(
      userId,

      cursor,

      limit + 1,
    ),

    getTaskTransactions(
      userId,

      cursor,

      limit + 1,
    ),
  ]);

  const merged = [...donations, ...taskPayments];

  merged.sort(
    (
      a,

      b,
    ) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const hasMore = merged.length > limit;

  const items = merged.slice(
    0,

    limit,
  );

  const transactions = items.map(mapPaymentHistory);

  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  return {
    transactions,
    nextCursor,
    hasMore,
  };
}

export async function getTransactionDetail(
  userId: string,

  id: string,
) {
  try {
    const donation = await getDonationTransactionById(
      userId,

      id,
    );

    if (donation) {
      return mapPaymentDetail(donation);
    }

    const task = await getTaskTransactionById(
      userId,

      id,
    );

    if (task) {
      return mapPaymentDetail(task);
    }

    throw new Error("Transaction tidak ditemukan.");
  } catch (error) {
    console.error(
      "[Transaction Detail]",

      error,
    );

    throw error;
  }
}