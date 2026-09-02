import {
  NextResponse,
} from "next/server";

import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

import {
  paymentStatusController,
} from "@/features/payments/controllers/paymentStatus.controller";

interface Context {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: Context,
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

    const {
      orderId,
    } = await params;

    const normalizedOrderId =
      orderId.trim();

    if (!normalizedOrderId) {
      return NextResponse.json(
        {
          message:
            "Order ID tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await paymentStatusController(
        user.id,
        normalizedOrderId,
      );

    return NextResponse.json(
      result,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PAYMENT STATUS ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "Payment tidak ditemukan."
    ) {
      return NextResponse.json(
        {
          message:
            "Payment tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

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