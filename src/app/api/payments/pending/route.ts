import {
  NextResponse,
} from "next/server";

import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

import {
  getLatestPendingPayment,
} from "@/lib/payments/server/pendingPayment.repository";

export async function GET() {
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

    const payment =
      await getLatestPendingPayment(
        user.id,
      );

    return NextResponse.json(
      {
        payment,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PENDING PAYMENT ERROR:",
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