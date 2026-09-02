import {
  NextResponse,
} from "next/server";

import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

import {
  getResumablePayment,
} from "@/lib/payments/server/pendingPayment.repository";

interface ResumePaymentRequest {
  orderId?: string;
}

export async function POST(
  request: Request,
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as ResumePaymentRequest;

    const orderId =
      body.orderId?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          message:
            "Order ID wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const payment =
      await getResumablePayment(
        user.id,
        orderId,
      );

    if (!payment) {
      return NextResponse.json(
        {
          message:
            "Payment tidak ditemukan atau tidak dapat dilanjutkan.",
        },
        {
          status: 404,
        },
      );
    }

    if (!payment.snapToken) {
      return NextResponse.json(
        {
          message:
            "Sesi pembayaran tidak tersedia.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        orderId:
          payment.orderId,

        paymentType:
          payment.paymentType,

        amount:
          payment.amount,

        snapToken:
          payment.snapToken,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "RESUME PAYMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}