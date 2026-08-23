import { adminSupabase } from "@/lib/supabase/admin";

export interface PaymentLookupResult {
  paymentType: "DONATION" | "URGENT_TASK";

  payment: Record<string, unknown>;
}

export async function findPaymentByOrderId(
  orderId: string,
): Promise<PaymentLookupResult | null> {
  const donation = await findDonationByOrderId(orderId);

  if (donation) {
    return {
      paymentType: "DONATION",

      payment: donation,
    };
  }

  const taskPayment = await findTaskPaymentByOrderId(orderId);

  if (taskPayment) {
    return {
      paymentType: "URGENT_TASK",

      payment: taskPayment,
    };
  }

  return null;
}

export async function findDonationByOrderId(orderId: string) {
  const {
    data,

    error,
  } = await adminSupabase

    .from("support_donations")

    .select("*")

    .eq("midtrans_order_id", orderId)

    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findTaskPaymentByOrderId(orderId: string) {
  const { data, error } = await adminSupabase
    .from("task_payments")
    .select("*")
    .eq("midtrans_order_id", orderId)

    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function attachTaskToPayment(
  paymentId: string,

  taskId: string,
) {
  const { error } = await adminSupabase
    .from("task_payments")
    .update({
      task_id: taskId,
    })
    .eq("id", paymentId);

  if (error) {
    throw error;
  }
}

export async function claimTaskPayment(paymentId: string) {
  const { data, error } = await adminSupabase

    .from("task_payments")

    .update({
      is_processing: true,
    })

    .eq(
      "id",

      paymentId,
    )

    .eq(
      "is_processing",

      false,
    )

    .select()

    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function releaseTaskPayment(paymentId: string) {
  const { error } = await adminSupabase

    .from("task_payments")

    .update({
      is_processing: false,
    })

    .eq(
      "id",

      paymentId,
    );

  if (error) {
    throw error;
  }
}

export async function findPaymentsForSimulator(paymentType?: string) {
  switch (paymentType) {
    case "DONATION":
      return await findDonationPaymentsForSimulator();

    case "URGENT_TASK":
      return await findUrgentTaskPaymentsForSimulator();

    default:
      return [];
  }
}

async function findDonationPaymentsForSimulator() {
  const {
    data,

    error,
  } = await adminSupabase

    .from("support_donations")

    .select(
      `
            id,
            midtrans_order_id,
            amount,
            payment_status,
            payment_method,
            created_at
        `,
    )

    .order("created_at", {
      ascending: false,
    })

    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((payment) => ({
    ...payment,

    payment_type: "DONATION",
  }));
}

async function findUrgentTaskPaymentsForSimulator() {
  const {
    data,

    error,
  } = await adminSupabase

    .from("task_payments")

    .select(
      `

            id,

            midtrans_order_id,

            payment_type,

            amount,

            payment_status,

            payment_method,

            created_at

        `,
    )

    .order(
      "created_at",

      {
        ascending: false,
      },
    )

    .limit(50);

  if (error) {
    throw error;
  }

  return data;
}

export async function getPaymentTypesForSimulator() {
  const { data, error } = await adminSupabase
    .from("task_payments")
    .select("payment_type");

  if (error) {
    throw error;
  }

  const types = new Set<string>();

  // DONATION selalu ada
  types.add("DONATION");

  (data ?? []).forEach((item) => {
    if (item.payment_type) {
      types.add(item.payment_type);
    }
  });

  return [...types];
}